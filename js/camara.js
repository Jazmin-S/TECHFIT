// ========= PARÁMETROS DEL EJERCICIO ==============
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
if (nombresEjercicio[ejercicioActual]) {
    tituloEj.textContent = "Ejecutando: " + nombresEjercicio[ejercicioActual];
} else {
    tituloEj.textContent = "";
}

// ========= ELEMENTOS DOM ==============
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

// Chat (si existe en el HTML)
const chatMessagesEl = document.getElementById("chat-messages");
const chatInputEl = document.getElementById("chat-input");
const chatSendEl = document.getElementById("chat-send");
const btnVoice = document.getElementById("btnVoice");

// ========= ESTADO GLOBAL ==============
let stream = null;
let detector = null;
let intervalo = null;

let isPaused = false;
let tiempoHIIT = 30;
let descanso = 10;
let enDescanso = false;

// progreso videojuego
let nivel = 1;
let xp = 0;
let xpNecesaria = 100;
let reps = 0;
let score = 0;
const STORAGE_KEY = "techfit_progress_v1";

// voz
let voiceEnabled = true;

// reconocimiento de voz
let recognition = null;
let voiceCommandsActive = false;

// ========= PROGRESO LOCALSTORAGE ==============
function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data) {
            if (typeof data.nivel === "number") nivel = data.nivel;
            if (typeof data.xp === "number") xp = data.xp;
            if (typeof data.xpNecesaria === "number") xpNecesaria = data.xpNecesaria;
            if (typeof data.score === "number") score = data.score;
        }
    } catch (e) {
        console.warn("No se pudo cargar progreso:", e);
    }
}

function saveProgress() {
    try {
        const data = { nivel, xp, xpNecesaria, score };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("No se pudo guardar progreso:", e);
    }
}

function updateHUD() {
    levelEl.textContent = nivel;
    xpTextEl.textContent = `${xp} / ${xpNecesaria}`;
    const pct = Math.max(0, Math.min(100, (xp / xpNecesaria) * 100));
    xpFillEl.style.width = pct + "%";
    repsEl.textContent = reps;
    scoreEl.textContent = score;
}

// ========= VOZ DEL ENTRENADOR ==========
function speakCoach(text) {
    if (!voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-MX";
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

function addXP(cantidad) {
    xp += cantidad;
    if (xp < 0) xp = 0;

    let leveledUp = false;

    while (xp >= xpNecesaria) {
        xp -= xpNecesaria;
        nivel++;
        xpNecesaria = Math.round(xpNecesaria * 1.15);
        leveledUp = true;
    }

    if (leveledUp) {
        const msg = `¡Nivel ${nivel}! Estás progresando muy bien.`;
        statusText.textContent = `🔥 LEVEL UP! Ahora eres nivel ${nivel}`;
        speakCoach(msg);
    }

    saveProgress();
    updateHUD();
}

function gradeRep(grade, countRep = true) {
    let xpGain = 0;
    let scoreGain = 0;

    switch (grade) {
        case "Perfect":
            xpGain = 20;
            scoreGain = 15;
            break;
        case "Good":
            xpGain = 12;
            scoreGain = 10;
            break;
        case "Bad":
            xpGain = 5;
            scoreGain = 5;
            break;
        default:
            xpGain = 0;
            scoreGain = 0;
    }

    if (countRep) reps++;
    score += scoreGain;
    gradeEl.textContent = grade;
    addXP(xpGain);

    // voz según calificación
    let phrase = "";
    if (grade === "Perfect") {
        phrase = "Repetición perfecta, sigue así.";
    } else if (grade === "Good") {
        phrase = "Muy bien, puedes pulir un poco la técnica.";
    } else if (grade === "Bad") {
        phrase = "Cuidado, corrige la postura antes de seguir.";
    }
    if (phrase) speakCoach(phrase);
}

// ========= FEEDBACK ==========
function setFeedback(text) {
    if (feedbackEl) {
        feedbackEl.textContent = text;
    }
}

// ========= AUDIOS ==========
const beep = new Audio("../img/sounds/beep.mp3");
const startSound = new Audio("../img/sounds/start.mp3");
const finishSound = new Audio("../img/sounds/finish.mp3");

// ========= INICIAR CÁMARA ==========
async function iniciarCamara() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };

        statusText.textContent = "Inicializando IA...";
        await cargarIA();

        iniciarCuentaRegresiva();
    } catch (err) {
        statusText.textContent = "No se pudo acceder a la cámara.";
        console.error(err);
    }
}

// ========= CARGAR IA (MOVENET) ==========
async function cargarIA() {
    try {
        statusText.textContent = "Inicializando TensorFlow...";
        await tf.setBackend("webgl");
        await tf.ready();

        statusText.textContent = "Cargando modelo IA...";

        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true
            }
        );

        statusText.textContent = "¡IA cargada con éxito!";
    } catch (error) {
        console.error("Error al cargar IA:", error);
        statusText.textContent = "Error al cargar IA.";
    }
}

loadProgress();
updateHUD();
iniciarCamara();

// ========= UTILIDADES GEO / ÁNGULOS ==========
function getAngleDeg(a, b, c) {
    if (!a || !b || !c) return 180;
    const v1 = { x: a.x - b.x, y: a.y - b.y };
    const v2 = { x: c.x - b.x, y: c.y - b.y };
    const mag1 = Math.hypot(v1.x, v1.y);
    const mag2 = Math.hypot(v2.x, v2.y);
    if (!mag1 || !mag2) return 180;
    const cos = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2);
    const clamped = Math.max(-1, Math.min(1, cos));
    return (Math.acos(clamped) * 180) / Math.PI;
}

// ========= ESTADOS POR EJERCICIO ==============
// Sentadillas
let squatState = "up";
let squatMinAngle = 180;

// Desplantes
let lungeState = "up";
let lungeMinAngle = 180;

// Elevaciones de brazo
let armState = "down";
let armMinY = 10000;

// Flexiones en pared
let pushState = "up";
let pushMinAngle = 180;

// Plancha
let plankGoodFrames = 0;

// Rodillas
let kneesState = "down";
let kneesMaxRaise = 0;

// Jumping jacks
let jumpingState = "closed";

// Elevaciones laterales pierna
let sideLegState = "down";
let sideLegMaxDiff = 0;

// ========= IA PERSONALIZADA POR EJERCICIO ==============

// --- 1) Sentadillas ---
function handleSentadillas(kp) {
    if (enDescanso) return;

    const lh = kp[11], lk = kp[13], la = kp[15];
    const rh = kp[12], rk = kp[14], ra = kp[16];

    if (!lh || !lk || !la || !rh || !rk || !ra) return;
    if (lh.score < 0.4 || lk.score < 0.4 || la.score < 0.4 || rh.score < 0.4 || rk.score < 0.4 || ra.score < 0.4) return;

    const angleL = getAngleDeg(lh, lk, la);
    const angleR = getAngleDeg(rh, rk, ra);
    const angle = (angleL + angleR) / 2;

    squatMinAngle = Math.min(squatMinAngle, angle);

    // Retroalimentación continua
    if (angle > 150) setFeedback("Buena extensión al subir. Mantén el equilibrio.");
    else if (angle > 100) setFeedback("Vas bajando, mantén la espalda recta.");
    else if (angle > 70) setFeedback("Excelente profundidad, activa el abdomen.");
    else setFeedback("Gran sentadilla, revisa que las rodillas no se cierren.");

    if (squatState === "up" && angle < 110) {
        squatState = "down";
    } else if (squatState === "down" && angle > 155) {
        let grade = "Bad";
        if (squatMinAngle < 80) grade = "Perfect";
        else if (squatMinAngle < 100) grade = "Good";

        statusText.textContent = `Sentadilla ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        squatMinAngle = 180;
        squatState = "up";
    }
}

// --- 2) Desplantes ---
function handleDesplantes(kp) {
    if (enDescanso) return;

    const lk = kp[13], la = kp[15], lh = kp[11];
    const rk = kp[14], ra = kp[16], rh = kp[12];
    if (!lk || !la || !lh || !rk || !ra || !rh) return;

    const angleL = getAngleDeg(lh, lk, la);
    const angleR = getAngleDeg(rh, rk, ra);
    const frontAngle = Math.min(angleL, angleR);

    lungeMinAngle = Math.min(lungeMinAngle, frontAngle);

    // Retroalimentación
    if (frontAngle > 150) setFeedback("Extensión correcta. Cambia de pierna y mantén el torso recto.");
    else if (frontAngle > 100) setFeedback("Buen control, baja un poco más manteniendo rodilla alineada.");
    else if (frontAngle > 70) setFeedback("Excelente desplante. Mantén rodilla cerca de 90°.");
    else setFeedback("Cuida que la rodilla no sobrepase la punta del pie.");

    if (lungeState === "up" && frontAngle < 115) {
        lungeState = "down";
    } else if (lungeState === "down" && frontAngle > 160) {
        let grade = "Bad";
        if (lungeMinAngle < 80) grade = "Perfect";
        else if (lungeMinAngle < 100) grade = "Good";

        statusText.textContent = `Desplante ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        lungeMinAngle = 180;
        lungeState = "up";
    }
}

// --- 3) Elevaciones de brazo ---
function handleElevacionesBrazo(kp) {
    if (enDescanso) return;

    const ls = kp[5], rs = kp[6], lw = kp[9], rw = kp[10];
    if (!ls || !rs || !lw || !rw) return;

    const leftUp = lw.score > 0.4 && ls.score > 0.4 && lw.y < ls.y - 20;
    const rightUp = rw.score > 0.4 && rs.score > 0.4 && rw.y < rs.y - 20;
    const anyUp = leftUp || rightUp;

    const minWristY = Math.min(
        leftUp ? lw.y : 9999,
        rightUp ? rw.y : 9999
    );

    let refShoulderY = Math.min(ls.y, rs.y);
    let diff = refShoulderY - minWristY; // cuanto más grande, más arriba

    // Retroalimentación
    if (anyUp) {
        if (diff > 120) setFeedback("¡Brazos altos! Excelente rango de movimiento.");
        else if (diff > 70) setFeedback("Buen trabajo, intenta elevar un poco más los brazos.");
        else setFeedback("Levanta más los brazos, evita encoger el cuello.");
    } else {
        setFeedback("Levanta el brazo con control, hombros relajados.");
    }

    if (anyUp) {
        armMinY = Math.min(armMinY, minWristY);
    }

    if (armState === "down" && anyUp) {
        armState = "up";
    } else if (armState === "up" && !anyUp) {
        let grade = "Bad";
        let diffFinal = refShoulderY - armMinY;
        if (diffFinal > 120) grade = "Perfect";
        else if (diffFinal > 70) grade = "Good";

        statusText.textContent = `Elevación ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        armMinY = 10000;
        armState = "down";
    }
}

// --- 4) Flexiones en pared ---
function handleFlexionesPared(kp) {
    if (enDescanso) return;

    const ls = kp[5], le = kp[7], lw = kp[9];
    const rs = kp[6], re = kp[8], rw = kp[10];

    if (!ls || !le || !lw || !rs || !re || !rw) return;

    const angleLE = getAngleDeg(ls, le, lw);
    const angleRE = getAngleDeg(rs, re, rw);
    const elbowAngle = (angleLE + angleRE) / 2;

    pushMinAngle = Math.min(pushMinAngle, elbowAngle);

    // Retroalimentación
    if (elbowAngle > 160) setFeedback("Empuje completo. Mantén codos cerca del cuerpo.");
    else if (elbowAngle > 120) setFeedback("Bajando… abdomen firme, evita arquear la espalda.");
    else if (elbowAngle > 80) setFeedback("Excelente profundidad, controla el movimiento sin rebotes.");
    else setFeedback("Muy profundo, cuida hombros y muñecas.");

    if (pushState === "up" && elbowAngle < 120) {
        pushState = "down";
    } else if (pushState === "down" && elbowAngle > 165) {
        let grade = "Bad";
        if (pushMinAngle < 70) grade = "Perfect";
        else if (pushMinAngle < 100) grade = "Good";

        statusText.textContent = `Flexión ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        pushMinAngle = 180;
        pushState = "up";
    }
}

// --- 5) Plancha (tiempo + alineación) ---
function handlePlancha(kp) {
    if (enDescanso) return;

    const ls = kp[5], rs = kp[6];
    const lh = kp[11], rh = kp[12];
    const la = kp[15], ra = kp[16];

    if (!ls || !rs || !lh || !rh || !la || !ra) return;

    const sY = (ls.y + rs.y) / 2;
    const hY = (lh.y + rh.y) / 2;
    const aY = (la.y + ra.y) / 2;

    const midLine = (sY + aY) / 2;
    const diff = hY - midLine; // + se hunde, - se eleva

    // Retroalimentación
    if (Math.abs(diff) < 15) {
        setFeedback("Postura excelente. Abdomen y glúteos bien activados.");
    } else if (diff > 20) {
        setFeedback("Cadera muy baja, eleva un poco y activa el abdomen.");
    } else if (diff < -20) {
        setFeedback("Cadera muy alta, baja ligeramente para alinear el cuerpo.");
    } else {
        setFeedback("Ajusta poco tu cadera para alinear hombros y tobillos.");
    }

    let grade = "Good";
    if (Math.abs(diff) < 15) {
        grade = "Perfect";
        plankGoodFrames++;
    } else if (Math.abs(diff) < 30) {
        grade = "Good";
        plankGoodFrames++;
    } else {
        grade = "Bad";
        plankGoodFrames = 0;
    }

    // cada ~30 frames (~1 segundo) cuenta como "repetición virtual"
    if (plankGoodFrames >= 30) {
        statusText.textContent = `Plancha estable: ${grade}`;
        gradeRep(grade, false); // no suma rep física, solo XP/score
        plankGoodFrames = 0;
    }
}

// --- 6) Elevación de rodillas ---
function handleRodillas(kp) {
    if (enDescanso) return;

    const lh = kp[11], rh = kp[12];
    const lk = kp[13], rk = kp[14];

    if (!lh || !rh || !lk || !rk) return;

    const hipY = (lh.y + rh.y) / 2;
    const leftRaise = hipY - lk.y;
    const rightRaise = hipY - rk.y;
    const bestRaise = Math.max(leftRaise, rightRaise);

    if (bestRaise > 40) {
        kneesMaxRaise = Math.max(kneesMaxRaise, bestRaise);
    }

    // Retroalimentación
    if (bestRaise > 110) setFeedback("¡Rodilla muy bien arriba! Excelente rango.");
    else if (bestRaise > 70) setFeedback("Buen trabajo, intenta subir un poco más la rodilla.");
    else if (bestRaise > 40) setFeedback("Buen ritmo, activa el abdomen al elevar la rodilla.");
    else setFeedback("Eleva una rodilla a la vez con control y estabilidad.");

    const anyUp = bestRaise > 40;

    if (kneesState === "down" && anyUp) {
        kneesState = "up";
    } else if (kneesState === "up" && !anyUp) {
        let grade = "Bad";
        if (kneesMaxRaise > 90) grade = "Perfect";
        else if (kneesMaxRaise > 60) grade = "Good";

        statusText.textContent = `Rodilla ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        kneesMaxRaise = 0;
        kneesState = "down";
    }
}

// --- 7) Jumping jacks modificados ---
function handleJumping(kp) {
    if (enDescanso) return;

    const ls = kp[5], rs = kp[6], lw = kp[9], rw = kp[10];
    const la = kp[15], ra = kp[16];

    if (!ls || !rs || !lw || !rw || !la || !ra) return;

    const armsUp = lw.y < ls.y - 10 && rw.y < rs.y - 10;
    const legsApart = Math.abs(la.x - ra.x) > 80;

    // Retroalimentación
    if (armsUp && legsApart) {
        setFeedback("¡Apertura completa! Muy buena coordinación.");
    } else if (armsUp) {
        setFeedback("Brazos bien, abre un poco más las piernas.");
    } else if (legsApart) {
        setFeedback("Piernas bien, sube más los brazos.");
    } else {
        setFeedback("Coordina brazos arriba y piernas abiertas a la vez.");
    }

    if (jumpingState === "closed" && armsUp && legsApart) {
        jumpingState = "open";
    } else if (jumpingState === "open" && !armsUp && !legsApart) {
        let grade = "Bad";
        const legDist = Math.abs(la.x - ra.x);
        if (legDist > 140) grade = "Perfect";
        else if (legDist > 100) grade = "Good";

        statusText.textContent = `Jumping jack ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        jumpingState = "closed";
    }
}

// --- 8) Elevaciones laterales de pierna ---
function handlePierna(kp) {
    if (enDescanso) return;

    const lh = kp[11], rh = kp[12];
    const la = kp[15], ra = kp[16];

    if (!lh || !rh || !la || !ra) return;

    // mayor separación horizontal pierna-cadera
    const diffLeft = Math.abs(la.x - lh.x);
    const diffRight = Math.abs(ra.x - rh.x);
    const bestDiff = Math.max(diffLeft, diffRight);

    if (bestDiff > 20) {
        sideLegMaxDiff = Math.max(sideLegMaxDiff, bestDiff);
    }

    // Retroalimentación
    if (bestDiff > 120) setFeedback("¡Gran elevación lateral! Control perfecto de cadera.");
    else if (bestDiff > 70) setFeedback("Buena elevación, evita rotar la cadera hacia atrás.");
    else if (bestDiff > 20) setFeedback("Sigue levantando lateralmente con control.");
    else setFeedback("Eleva la pierna hacia un lado, sin girar el tronco.");

    const lifted = bestDiff > 20;

    if (sideLegState === "down" && lifted) {
        sideLegState = "up";
    } else if (sideLegState === "up" && !lifted) {
        let grade = "Bad";
        if (sideLegMaxDiff > 120) grade = "Perfect";
        else if (sideLegMaxDiff > 70) grade = "Good";

        statusText.textContent = `Elevación de pierna ${reps + 1}: ${grade}`;
        gradeRep(grade, true);

        sideLegMaxDiff = 0;
        sideLegState = "down";
    }
}

// --- Genérico (si no coincide ninguno) ---
function handleGenerico(kp) {
    const ls = kp[5], rs = kp[6];
    if (!ls || !rs) return;
    const inclinacion = Math.abs(ls.y - rs.y);
    if (inclinacion > 25) {
        statusText.textContent = "❗ Te estás inclinando, corrige postura";
        setFeedback("Intenta alinear ambos hombros a la misma altura.");
    } else {
        statusText.textContent = "✔ Postura correcta";
        setFeedback("Mantén la alineación, respira y continúa.");
    }
}

// Selección de handler según el ejercicio
let exerciseHandler = handleGenerico;
switch (ejercicioActual) {
    case "sentadillas":
        exerciseHandler = handleSentadillas;
        break;
    case "desplantes":
        exerciseHandler = handleDesplantes;
        break;
    case "elevaciones_brazo":
        exerciseHandler = handleElevacionesBrazo;
        break;
    case "flexiones_pared":
        exerciseHandler = handleFlexionesPared;
        break;
    case "plancha":
        exerciseHandler = handlePlancha;
        break;
    case "rodillas":
        exerciseHandler = handleRodillas;
        break;
    case "jumping":
        exerciseHandler = handleJumping;
        break;
    case "pierna":
        exerciseHandler = handlePierna;
        break;
    default:
        exerciseHandler = handleGenerico;
        break;
}

// ========= LOOP PRINCIPAL DE IA ==========
async function detectarPostura() {
    if (!detector || video.paused || video.ended) return;

    const poses = await detector.estimatePoses(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (poses.length > 0) {
        const kp = poses[0].keypoints;

        // dibujar puntos
        ctx.fillStyle = "#00ff88";
        kp.forEach(p => {
            if (p.score > 0.4) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        exerciseHandler(kp);
    }

    requestAnimationFrame(detectarPostura);
}

// ========= CUENTA REGRESIVA + HIIT ==========
function iniciarCuentaRegresiva() {
    let count = 3;
    countdownBox.textContent = count;

    let intervaloCuenta = setInterval(() => {
        beep.currentTime = 0;
        beep.play();
        count--;
        countdownBox.textContent = count;

        if (count === 0) {
            clearInterval(intervaloCuenta);
            startSound.currentTime = 0;
            startSound.play();
            countdownBox.textContent = "¡GO!";

            speakCoach("Comencemos. Mantén una buena técnica en cada repetición.");

            setTimeout(() => {
                countdownBox.textContent = "";
                iniciarHIIT();
                detectarPostura();
            }, 700);
        }
    }, 1000);
}

function iniciarHIIT() {
    let tiempo = tiempoHIIT;
    enDescanso = false;
    timerBox.style.color = "#00ff7f";
    statusText.textContent = "¡Ejercicio en progreso!";

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

    speakCoach("Descanso. Respira profundo y prepárate para la siguiente ronda.");

    intervalo = setInterval(() => {
        timerBox.textContent = `${tiempo}s`;
        tiempo--;

        if (tiempo < 0) {
            clearInterval(intervalo);
            finishSound.currentTime = 0;
            finishSound.play();
            iniciarHIIT();
        }
    }, 1000);
}

// ========= CHAT ENTRENADOR AI (LÓGICA LOCAL) ==========
function addChatMessage(sender, text) {
    if (!chatMessagesEl) return;
    const div = document.createElement("div");
    div.className = "chat-msg chat-" + sender;
    div.textContent = text;
    chatMessagesEl.appendChild(div);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function getCoachReply(userText) {
    const t = userText.toLowerCase();
    let base = "";

    if (t.includes("postura") || t.includes("forma") || t.includes("técnica")) {
        base = "Concéntrate en la técnica: mueve controlado, no rápido. ";
        base += "Recuerda que ahora estás haciendo " + (nombresEjercicio[ejercicioActual] || "el ejercicio actual") + ".";
    } else if (t.includes("repeticiones") || t.includes("reps") || t.includes("cuántas")) {
        base = `Llevas ${reps} repeticiones registradas y un puntaje de ${score}. `;
        base += "Apunta a repeticiones de calidad más que cantidad.";
    } else if (t.includes("nivel") || t.includes("progreso")) {
        base = `Actualmente estás en nivel ${nivel}, con ${xp} de XP. `;
        base += "Sigue entrenando con buena técnica y subirás de nivel más rápido.";
    } else if (t.includes("cansado") || t.includes("fatiga") || t.includes("fatigado")) {
        base = "Si te sientes muy cansado, baja un poco la intensidad, mantén la técnica y escucha a tu cuerpo. ";
        base += "El descanso también forma parte del progreso.";
    } else if (t.includes("dolor") || t.includes("lesión")) {
        base = "Si sientes dolor agudo, detén el ejercicio. ";
        base += "La prioridad es tu seguridad; revisa tu postura y considera consultar a un profesional si el dolor continúa.";
    } else {
        base = "Estoy aquí para ayudarte con tu técnica y tu progreso. ";
        base += "Puedes preguntarme sobre postura, repeticiones, nivel o cómo ejecutar mejor el ejercicio.";
    }

    return base;
}

if (chatSendEl && chatInputEl && chatMessagesEl) {
    chatSendEl.addEventListener("click", () => {
        const text = chatInputEl.value.trim();
        if (!text) return;
        addChatMessage("user", text);
        chatInputEl.value = "";

        const reply = getCoachReply(text);
        addChatMessage("coach", reply);
        speakCoach(reply);
    });

    chatInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            chatSendEl.click();
        }
    });
}

// ========= COMANDOS DE VOZ ==========
function setupVoiceCommands() {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
        console.warn("API de reconocimiento de voz no disponible");
        if (btnVoice) btnVoice.style.display = "none";
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const res = event.results[event.results.length - 1];
        const transcript = res[0].transcript.toLowerCase().trim();
        console.log("Comando de voz:", transcript);

        if (chatMessagesEl) {
            addChatMessage("user", `🎤 ${transcript}`);
        }

        if (transcript.includes("pausa") || transcript.includes("pausar")) {
            pauseTraining(true);
        } else if (transcript.includes("reanudar") || transcript.includes("continuar") || transcript.includes("seguir")) {
            resumeTraining(true);
        } else if (transcript.includes("detener") || transcript.includes("terminar") || transcript.includes("finalizar") || transcript.includes("parar")) {
            stopTraining(true);
        } else if (transcript.includes("ayuda") || transcript.includes("consejo")) {
            const reply = getCoachReply("ayuda");
            addChatMessage("coach", reply);
            speakCoach(reply);
        }
    };

    recognition.onend = () => {
        if (voiceCommandsActive) {
            recognition.start();
        }
    };

    recognition.onerror = (e) => {
        console.warn("Error en reconocimiento de voz:", e);
    };
}

function startVoiceCommands() {
    if (!recognition) return;
    voiceCommandsActive = true;
    recognition.start();
    if (btnVoice) btnVoice.textContent = "🎤 Comandos de voz: ON";
    speakCoach("Comandos de voz activados. Puedes decir pausar, reanudar o detener.");
}

function stopVoiceCommands(manual = false) {
    if (!recognition) return;
    voiceCommandsActive = false;
    recognition.stop();
    if (btnVoice) btnVoice.textContent = "🎤 Comandos de voz";
    if (manual) speakCoach("Comandos de voz desactivados.");
}

if (btnVoice) {
    setupVoiceCommands();
    btnVoice.addEventListener("click", () => {
        if (!recognition) return;
        if (!voiceCommandsActive) {
            startVoiceCommands();
        } else {
            stopVoiceCommands(true);
        }
    });
}

// ========= PAUSAR / REANUDAR / DETENER (REUTILIZADO POR BOTONES Y VOZ) ==========
function pauseTraining(fromVoice = false) {
    if (isPaused) return;
    video.pause();
    isPaused = true;
    clearInterval(intervalo);
    statusText.textContent = "Video en pausa";
    document.getElementById("btnPausar").textContent = "Reanudar";

    // Pausar sonidos
    beep.pause();
    startSound.pause();
    finishSound.pause();

    if (fromVoice) {
        const msg = "He pausado el ejercicio por comando de voz.";
        if (chatMessagesEl) addChatMessage("coach", msg);
        speakCoach(msg);
    }
}

function resumeTraining(fromVoice = false) {
    if (!isPaused) return;
    video.play();
    iniciarHIIT();
    detectarPostura();
    isPaused = false;
    statusText.textContent = "Reanudado";
    document.getElementById("btnPausar").textContent = "Pausar";

    if (fromVoice) {
        const msg = "Reanudando el ejercicio.";
        if (chatMessagesEl) addChatMessage("coach", msg);
        speakCoach(msg);
    }
}

function stopTraining(fromVoice = false) {
    if (stream) stream.getTracks().forEach(track => track.stop());
    clearInterval(intervalo);

    // Pausar sonidos
    beep.pause();
    startSound.pause();
    finishSound.pause();

    if (fromVoice) {
        const msg = "He detenido el ejercicio. Buen trabajo.";
        if (chatMessagesEl) addChatMessage("coach", msg);
        speakCoach(msg);
    }

    window.location.href = "catalogo.html";
}

// ========= BOTONES PAUSAR / DETENER ==========
const btnPausar = document.getElementById("btnPausar");
const btnDetener = document.getElementById("btnDetener");

if (btnPausar) {
    btnPausar.addEventListener("click", () => {
        if (!isPaused) pauseTraining(false);
        else resumeTraining(false);
    });
}

if (btnDetener) {
    btnDetener.addEventListener("click", () => stopTraining(false));
}
