/* ============================================================
   TECHFIT — Sistema de cámara + IA optimizado y reparado
   Corrección de freezes, doble loops y modelo MoveNet
   ============================================================ */

/* ========= PARÁMETROS DEL EJERCICIO ============== */
const params = new URLSearchParams(window.location.search);
const ejercicioActual = params.get("ejercicio") || "generico";

const nombresEjercicio = {
    sentadillas: "Sentadillas básicas",
    desplantes: "Desplantes",
    elevaciones_brazo: "Elevaciones de brazo",
    flexiones_pared: "Flexiones de pared",
    plancha: "Plancha básica",
    rodillas: "Elevación de rodillas",
    jumping: "Jumping jacks modificados",
    pierna: "Elevaciones laterales de pierna"
};

const tituloEj = document.getElementById("nombre-ejercicio");
tituloEj.textContent =
    nombresEjercicio[ejercicioActual] ?
    "Ejecutando: " + nombresEjercicio[ejercicioActual] :
    "";

/* ========= ELEMENTOS DOM ============== */
let video = document.getElementById("video");
let canvas = document.getElementById("poseCanvas");
let ctx = canvas.getContext("2d");
let statusText = document.getElementById("status");
let countdownBox = document.getElementById("countdown");
let timerBox = document.getElementById("timer");

const levelEl = document.getElementById("hud-level");
const xpTextEl = document.getElementById("hud-xp");
const xpFillEl = document.getElementById("xp-fill");
const repsEl = document.getElementById("hud-reps");
const scoreEl = document.getElementById("hud-score");
const gradeEl = document.getElementById("hud-grade");
const feedbackEl = document.getElementById("feedback");

/* ========= ESTADOS GLOBALES ============== */
let stream = null;
let detector = null;
let detecting = false;
let isPaused = false;

// Estados de ejercicios
let squatState = "up";
let squatMinAngle = 180;
let lungeState = "up";
let armState = "down";
let pushState = "up";
let plankGoodFrames = 0;
let kneesState = "down";
let jumpingState = "closed";
let sideLegState = "down";

// HIIT
let tiempoHIIT = 30;
let descanso = 10;
let enDescanso = false;
let intervalo = null;

// progreso videojuego
let nivel = 1;
let xp = 0;
let xpNecesaria = 100;
let reps = 0;
let score = 0;
const STORAGE_KEY = "techfit_progress_v1";

// ========= UTILIDADES ============== */
function getAngleDeg(a, b, c) {
    if (!a || !b || !c) return 180;
    const AB = { x: a.x - b.x, y: a.y - b.y };
    const CB = { x: c.x - b.x, y: c.y - b.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const mag1 = Math.hypot(AB.x, AB.y);
    const mag2 = Math.hypot(CB.x, CB.y);
    if (!mag1 || !mag2) return 180;
    const cos = dot / (mag1 * mag2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

function setFeedback(text) {
    if (feedbackEl) feedbackEl.textContent = text;
}

/* ========= EFECTOS DE REP ORIGINALES (LUZ VERDE/ROJA) ========== */
function gradeRep(grade, sumaRep) {
    if (sumaRep) reps++;

    score += (grade === "Perfect" ? 10 : grade === "Good" ? 6 : 2);
    repsEl.textContent = reps;
    scoreEl.textContent = score;
    gradeEl.textContent = grade;

    document.body.classList.remove("rep-perfect", "rep-good", "rep-bad");
    if (grade === "Perfect") document.body.classList.add("rep-perfect");
    else if (grade === "Good") document.body.classList.add("rep-good");
    else document.body.classList.add("rep-bad");

    setTimeout(() => {
        document.body.classList.remove("rep-perfect", "rep-good", "rep-bad");
    }, 700);
}

/* ========= MANEJADORES DE EJERCICIOS (TUS FUNCIONES AFINADAS) ========= */
function handleSentadillas(kp) {
    if (enDescanso) return;

    const lh = kp[11], lk = kp[13], la = kp[15];
    const rh = kp[12], rk = kp[14], ra = kp[16];
    if (!lh || !lk || !la || !rh || !rk || !ra) return;

    const angle = (getAngleDeg(lh, lk, la) + getAngleDeg(rh, rk, ra)) / 2;

    squatMinAngle = Math.min(squatMinAngle, angle);

    if (angle > 165) setFeedback("Extiende al subir.");
    else if (angle > 120) setFeedback("Baja con control.");
    else if (angle > 90) setFeedback("Muy bien, baja más.");
    else setFeedback("Excelente profundidad.");

    if (squatState === "up" && angle < 105) {
        squatState = "down";
    } else if (squatState === "down" && angle > 165) {
        let grade = squatMinAngle < 70 ? "Perfect" :
                    squatMinAngle < 95 ? "Good" : "Bad";

        gradeRep(grade, true);
        squatMinAngle = 180;
        squatState = "up";
    }
}

function handleDesplantes(kp) {
    if (enDescanso) return;
    const lh = kp[11], lk = kp[13], la = kp[15];
    const rh = kp[12], rk = kp[14], ra = kp[16];
    if (!lk || !rk) return;

    const angle = Math.min(getAngleDeg(lh, lk, la), getAngleDeg(rh, rk, ra));

    if (angle > 150) setFeedback("Da un paso más grande.");
    else if (angle > 120) setFeedback("Baja recto.");
    else if (angle > 90) setFeedback("Muy bien.");
    else setFeedback("Excelente bajada.");

    if (lungeState === "up" && angle < 100) {
        lungeState = "down";
    } else if (lungeState === "down" && angle > 150) {
        let grade = angle < 85 ? "Perfect" :
                    angle < 110 ? "Good" : "Bad";
        gradeRep(grade, true);
        lungeState = "up";
    }
}

function handleElevacionesBrazo(kp) {
    const ls = kp[5], le = kp[7];
    const rs = kp[6], re = kp[8];
    if (!ls || !le || !rs || !re) return;

    const angle = Math.max(
        getAngleDeg(le, ls, { x: ls.x, y: ls.y - 100 }),
        getAngleDeg(re, rs, { x: rs.x, y: rs.y - 100 })
    );

    if (angle < 30) setFeedback("Sube más el brazo.");
    else if (angle < 70) setFeedback("Muy bien.");
    else setFeedback("Excelente elevación.");

    if (armState === "down" && angle > 65) armState = "up";
    else if (armState === "up" && angle < 25) {
        gradeRep("Good", true);
        armState = "down";
    }
}

function handleFlexionesPared(kp) {
    const ls = kp[5], lh = kp[11];
    if (!ls || !lh) return;

    const torsoAngle = Math.abs(ls.y - lh.y);

    if (torsoAngle < 40) setFeedback("Inclínate más.");
    else if (torsoAngle < 80) setFeedback("Bien inclinado.");
    else setFeedback("Muy buena alineación.");

    if (pushState === "up" && torsoAngle > 70) pushState = "down";
    else if (pushState === "down" && torsoAngle < 40) {
        gradeRep("Good", true);
        pushState = "up";
    }
}

function handlePlancha(kp) {
    const ls = kp[5], lh = kp[11], la = kp[15];
    if (!ls || !lh || !la) return;

    const sY = ls.y;
    const hY = lh.y;
    const aY = la.y;

    const mid = (sY + aY) / 2;
    const diff = hY - mid;

    if (Math.abs(diff) < 10) {
        setFeedback("Postura excelente.");
        plankGoodFrames++;
    } else if (diff > 20) setFeedback("Cadera muy baja.");
    else if (diff < -20) setFeedback("Cadera alta.");

    if (plankGoodFrames > 30) {
        gradeRep("Perfect", false);
        plankGoodFrames = 0;
    }
}

function handleRodillas(kp) {
    const lh = kp[11], lk = kp[13];
    const rh = kp[12], rk = kp[14];

    const kneeY = Math.min(lk.y, rk.y);
    const hipY = Math.min(lh.y, rh.y);
    const diff = hipY - kneeY;

    if (diff < 20) setFeedback("Sube más la rodilla.");
    else if (diff < 40) setFeedback("Muy bien.");
    else setFeedback("Excelente elevación.");

    if (kneesState === "down" && diff > 35) kneesState = "up";
    else if (kneesState === "up" && diff < 15) {
        gradeRep("Good", true);
        kneesState = "down";
    }
}

function handleJumping(kp) {
    const lh = kp[11], rh = kp[12];
    const lo = kp[9], ro = kp[10];
    if (!lo || !ro) return;

    const handY = Math.min(lo.y, ro.y);
    const hipY = Math.min(lh.y, rh.y);

    if (handY < hipY - 80 && jumpingState === "closed") {
        setFeedback("Muy bien, brazos arriba.");
        jumpingState = "open";
    } else if (handY > hipY - 20 && jumpingState === "open") {
        gradeRep("Good", true);
        jumpingState = "closed";
    }
}

function handlePierna(kp) {
    const lh = kp[11], lk = kp[13];
    if (!lk || !lh) return;

    const diff = lh.x - lk.x;

    if (diff < 25) setFeedback("Eleva más la pierna.");
    else if (diff < 50) setFeedback("Muy bien.");
    else setFeedback("Excelente elevación.");

    if (sideLegState === "down" && diff > 45) sideLegState = "up";
    else if (sideLegState === "up" && diff < 10) {
        gradeRep("Good", true);
        sideLegState = "down";
    }
}

/* ========= MAPA DE EJERCICIOS ========= */
const handlers = {
    sentadillas: handleSentadillas,
    desplantes: handleDesplantes,
    elevaciones_brazo: handleElevacionesBrazo,
    flexiones_pared: handleFlexionesPared,
    plancha: handlePlancha,
    rodillas: handleRodillas,
    jumping: handleJumping,
    pierna: handlePierna,
};

const exerciseHandler = handlers[ejercicioActual] || function(){};

/* ============================================================
   🔥 INICIALIZAR CÁMARA + IA (arreglado)
============================================================ */
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" }
        });

        video.srcObject = stream;

        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            };
        });

    } catch (e) {
        console.error("Error cámara:", e);
        statusText.textContent = "No se pudo acceder a la cámara.";
    }
}

/* ============================================================
   🔥 CARGAR MOVENET (versión correcta 2025)
============================================================ */
async function initModel() {
    try {
        statusText.textContent = "Cargando IA...";
        
        // Primero establecer el backend
        await tf.setBackend("webgl");
        await tf.ready();
        
        statusText.textContent = "Cargando modelo de poses...";

        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
            }
        );

        statusText.textContent = "IA lista.";
        console.log("Modelo MoveNet cargado correctamente");
    } catch (error) {
        console.error("Error IA:", error);
        statusText.textContent = "Error al cargar IA: " + error.message;
    }
}

/* ============================================================
   🔥 DIBUJAR ESQUELETO COMPLETO (PUNTOS Y LÍNEAS)
============================================================ */
function drawSkeleton(keypoints, minConfidence = 0.3) {
    // Configuración de colores y estilos
    ctx.fillStyle = "#00FF88";
    ctx.strokeStyle = "#00FF88";
    ctx.lineWidth = 2;
    
    // Dibujar puntos (keypoints)
    keypoints.forEach((keypoint) => {
        if (keypoint.score >= minConfidence) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Añadir un borde para mejor visibilidad
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.strokeStyle = "#00FF88";
            ctx.lineWidth = 2;
        }
    });
    
    // Definir conexiones del esqueleto
    const connections = [
        // Cara y torso
        [5, 6], [5, 11], [6, 12], [11, 12],
        // Brazos izquierdos
        [5, 7], [7, 9], 
        // Brazos derechos
        [6, 8], [8, 10],
        // Pierna izquierda
        [11, 13], [13, 15],
        // Pierna derecha
        [12, 14], [14, 16]
    ];
    
    // Dibujar líneas del esqueleto
    connections.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        
        if (kp1.score >= minConfidence && kp2.score >= minConfidence) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });
}

/* ============================================================
   🔥 LOOP DE DETECCIÓN (NO SE CONGELA)
============================================================ */
async function detectLoop() {
    if (!detector || isPaused || !detecting) {
        requestAnimationFrame(detectLoop);
        return;
    }

    try {
        const poses = await detector.estimatePoses(video, {
            maxPoses: 1,
            flipHorizontal: false
        });

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (poses.length > 0 && poses[0].keypoints) {
            const keypoints = poses[0].keypoints;
            
            // 🔥 Dibujar esqueleto completo (puntos + líneas)
            drawSkeleton(keypoints, 0.3);
            
            // 🔥 Procesar el ejercicio
            exerciseHandler(keypoints);
        }
    } catch (error) {
        console.error("Error en detección:", error);
    }

    requestAnimationFrame(detectLoop);
}

/* ============================================================
   🔥 HIIT + CONTROL
============================================================ */
function iniciarHIIT() {
    let tiempo = tiempoHIIT;
    enDescanso = false;
    timerBox.style.color = "#00ff7f";
    statusText.textContent = "Entrenando...";

    intervalo = setInterval(() => {
        timerBox.textContent = `${tiempo}s`;
        tiempo--;
        if (tiempo < 0) {
            clearInterval(intervalo);
            iniciarDescanso();
        }
    }, 1000);
}

function iniciarDescanso() {
    let tiempo = descanso;
    enDescanso = true;
    timerBox.style.color = "#ffae00";
    statusText.textContent = "Descanso...";

    intervalo = setInterval(() => {
        timerBox.textContent = `${tiempo}s`;
        tiempo--;
        if (tiempo < 0) {
            clearInterval(intervalo);
            iniciarHIIT();
        }
    }, 1000);
}

/* ============================================================
   🔥 PAUSA / REANUDAR / DETENER (para voz y botones)
============================================================ */
function pauseTraining() {
    isPaused = true;
    video.pause();
    statusText.textContent = "Pausado";
}

function resumeTraining() {
    isPaused = false;
    video.play();
    statusText.textContent = "Reanudado";
}

function stopTraining() {
    detecting = false;
    isPaused = true;
    if (intervalo) clearInterval(intervalo);
    if (stream) stream.getTracks().forEach(t => t.stop());
    window.location.href = "catalogo.html";
}

/* ============================================================
   🔥 INICIO COMPLETO
============================================================ */
(async function start() {
    await initCamera();
    await initModel();
    
    // Configurar botones
    document.getElementById("btnPausar").addEventListener("click", pauseTraining);
    document.getElementById("btnDetener").addEventListener("click", stopTraining);
    
    detectarCuentaRegresiva();
})();

function detectarCuentaRegresiva() {
    let count = 3;
    countdownBox.textContent = count;
    countdownBox.style.display = "block";

    const timer = setInterval(() => {
        count--;
        countdownBox.textContent = count;

        if (count === 0) {
            clearInterval(timer);
            countdownBox.textContent = "";
            countdownBox.style.display = "none";
            iniciarHIIT();
            detecting = true;
            detectLoop();  // ¡Loop real!
        }
    }, 1000);
}