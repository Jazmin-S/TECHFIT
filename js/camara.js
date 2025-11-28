/* ==========================================================
   TECHFIT — EJECUCIÓN MODO OPTIMIZADO HÍBRIDO
   (FLUIDO + SOLO POSE + CONTROL POR VOZ/BOTONES)
========================================================== */

let modalAbierto = false;
let hiitTimerInterval = null;
let hiitTimeLeft = 30;
let hiitRunning = true;

// Control de cámara / Holistic
let holistic = null;
let videoElement, canvasElement, canvasCtx;
let running = true;
let repCount = 0;
let score = 0;
let stateA = "start";
let currentExercise = null;
let smoothed = null;
let frameCount = 0;
let processingFrame = false;

// UI
let feedbackTxt, repsTxt, scoreTxt;
let hiitTimeElement, hiitLabelElement, timerStatusElement, cameraStatusElement;

/* ==========================================================
   MODAL SALIDA
========================================================== */
function mostrarModalSalida() {
    const modal = document.getElementById("exitModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modalAbierto = true;

    try { speak("¿Deseas continuar o salir?"); } catch (e) {}
}

function cerrarModalSalida() {
    const modal = document.getElementById("exitModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modalAbierto = false;
}

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

function initApp() {
    // Parámetros de URL
    const params = new URLSearchParams(window.location.search);
    currentExercise = (params.get("ejercicio") || "").trim();

    // Elementos UI
    feedbackTxt = document.getElementById("feedback");
    repsTxt = document.getElementById("hud-reps");
    scoreTxt = document.getElementById("hud-score");
    hiitTimeElement = document.getElementById("hiit-time");
    hiitLabelElement = document.getElementById("hiit-label");
    timerStatusElement = document.getElementById("timer-status");
    cameraStatusElement = document.getElementById("cameraStatus");

    // Elementos de video / canvas
    videoElement = document.getElementById("video");
    canvasElement = document.getElementById("poseCanvas");
    if (canvasElement) {
        canvasCtx = canvasElement.getContext("2d");
        canvasElement.width = 480;
        canvasElement.height = 360;
    }

    // Mostrar nombre de ejercicio
    if (currentExercise) {
        const nombreEjercicio = document.getElementById("nombre-ejercicio");
        if (nombreEjercicio) nombreEjercicio.textContent = currentExercise;
    }

    actualizarEstadoTimer("running");

    initControls();
    initHIITTimer(true);
    initHolistic();

    const seguirBtn = document.getElementById("seguirBtn");
    const salirBtn = document.getElementById("salirBtn");

    if (seguirBtn) {
        seguirBtn.onclick = () => {
            reanudarEjercicio("botón"); // aquí ya se encarga de cerrar modal y reiniciar si hace falta
        };
    }

    if (salirBtn) {
        salirBtn.onclick = () => {
            try { speak("Saliendo del ejercicio."); } catch (e) {}
            running = false;
            hiitRunning = false;
            window.location.href = "/pages/Catalogos/catalogo.html";
        };
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

/* ==========================================================
   UTILIDADES
========================================================== */

function setFeedback(msg) {
    if (feedbackTxt) feedbackTxt.textContent = msg;
    try { speak(msg); } catch (e) {}
}

function rep(good = false) {
    repCount++;
    if (repsTxt) repsTxt.textContent = repCount;
    score += good ? 10 : 5;
    if (scoreTxt) scoreTxt.textContent = score;
}

function angle(a, b, c) {
    const AB = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const CB = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

    const dot = AB.x * CB.x + AB.y * CB.y + AB.z * CB.z;
    const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2 + AB.z ** 2);
    const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2 + CB.z ** 2);

    return Math.acos(dot / (magAB * magCB)) * 180 / Math.PI;
}

function dist(a, b) {
    return Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2 +
        (a.z - b.z) ** 2
    );
}

/* ==========================================================
   SUAVIZADO EXPO
========================================================== */
function smoothLandmarks(raw, alpha = 0.4) {
    if (!smoothed) {
        smoothed = JSON.parse(JSON.stringify(raw));
        return smoothed;
    }

    for (let i = 0; i < raw.length; i++) {
        smoothed[i].x = smoothed[i].x * (1 - alpha) + raw[i].x * alpha;
        smoothed[i].y = smoothed[i].y * (1 - alpha) + raw[i].y * alpha;
        smoothed[i].z = smoothed[i].z * (1 - alpha) + raw[i].z * alpha;
    }

    return smoothed;
}

/* ==========================================================
   EJERCICIOS (USAN SOLO POSE)
========================================================== */

function sentadillas(lm) {
    const hip = lm[23], knee = lm[25], ankle = lm[27];
    if (!hip || !knee || !ankle) return;

    const kneeAng = angle(hip, knee, ankle);

    if (kneeAng < 95 && stateA === "start") {
        stateA = "down";
        setFeedback("Bien bajado ✔");
    }
    if (kneeAng > 160 && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición completa 🔥 +10pts");
    }
}

function elevaciones_brazo(lm) {
    const shoulder = lm[11], elbow = lm[13], wrist = lm[15];
    if (!shoulder || !elbow || !wrist) return;

    const ang = angle(shoulder, elbow, wrist);

    if (ang > 150 && stateA === "start") {
        stateA = "up";
        setFeedback("Brazo arriba ✔");
    }
    if (ang < 80 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥 +10pts");
    }
}

function rodillas(lm) {
    const hip = lm[23], knee = lm[25];
    if (!hip || !knee) return;

    const diff = hip.y - knee.y;

    if (diff < -0.03 && stateA === "start") {
        stateA = "up";
        setFeedback("Rodilla arriba ✔");
    }
    if (diff > -0.01 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Bien hecho 🔥 +10pts");
    }
}

function jumping(lm) {
    const lAnkle = lm[27], rAnkle = lm[28];
    if (!lAnkle || !rAnkle) return;

    const d = dist(lAnkle, rAnkle);

    if (d > 0.25 && stateA === "start") {
        stateA = "open";
        setFeedback("Piernas abiertas ✔");
    }
    if (d < 0.1 && stateA === "open") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥 +10pts");
    }
}

function pierna(lm) {
    const hip = lm[23], ankle = lm[27];
    if (!hip || !ankle) return;

    const diff = hip.x - ankle.x;

    if (diff < -0.05 && stateA === "start") {
        stateA = "up";
        setFeedback("Arriba ✔");
    }
    if (diff > -0.02 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥 +10pts");
    }
}

function glute_bridge(lm) {
    const hip = lm[23], knee = lm[25];
    if (!hip || !knee) return;

    const diff = hip.y - knee.y;

    if (diff < -0.03 && stateA === "start") {
        stateA = "up";
        setFeedback("Cadera arriba ✔");
    }
    if (diff > -0.01 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥 +10pts");
    }
}

function remo_banda(lm) {
    const shoulder = lm[11], elbow = lm[13];
    if (!shoulder || !elbow) return;

    const ang = angle({ x: shoulder.x - 0.1, y: shoulder.y, z: shoulder.z }, shoulder, elbow);

    if (ang < 110 && stateA === "start") {
        stateA = "pull";
        setFeedback("Jala fuerte ✔");
    }
    if (ang > 150 && stateA === "pull") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥 +10pts");
    }
}

function elevacion_talones(lm) {
    const hip = lm[23], ankle = lm[27];
    if (!hip || !ankle) return;

    const diff = hip.y - ankle.y;

    if (diff > 0.08 && stateA === "start") {
        stateA = "up";
        setFeedback("Arriba ✔");
    }
    if (diff < 0.04 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥 +10pts");
    }
}

function estiramiento_cuello(lm) {
    const leftEar = lm[7];
    const rightEar = lm[8];
    const nose = lm[0];

    if (!leftEar || !rightEar || !nose) return;

    const diff = leftEar.y - rightEar.y;

    // UMBRALES MÁS SENSIBLES PARA QUE SÍ CUENTE
    if (diff > 0.015 && stateA === "start") {
        stateA = "left";
        setFeedback("Inclina a la derecha →");
    }
    if (diff < -0.015 && stateA === "start") {
        stateA = "right";
        setFeedback("Inclina a la izquierda ←");
    }
    if (Math.abs(diff) < 0.008 && (stateA === "left" || stateA === "right")) {
        rep(true);
        stateA = "start";
        setFeedback("Estiramiento completo 🔥 +10pts");
    }
}

/* ==========================================================
   MAPEADOR
========================================================== */
const EXERCISES = {
    sentadillas,
    elevaciones_brazo,
    rodillas,
    jumping,
    pierna,
    glute_bridge,
    remo_banda,
    elevacion_talones,
    estiramiento_cuello
};

/* ==========================================================
   ESTADO DEL TIMER
========================================================== */
function actualizarEstadoTimer(estado) {
    if (!hiitTimeElement || !timerStatusElement || !cameraStatusElement) return;

    hiitTimeElement.classList.remove("timer-paused", "timer-stopped");

    if (estado === "running") {
        timerStatusElement.textContent = "Activo";
        cameraStatusElement.textContent = "Cámara: Activa • Temporizador: Activo";
    } else if (estado === "paused") {
        timerStatusElement.textContent = "Pausado";
        hiitTimeElement.classList.add("timer-paused");
        cameraStatusElement.textContent = "Cámara: Activa • Temporizador: Pausado";
    } else if (estado === "stopped") {
        timerStatusElement.textContent = "Finalizado";
        hiitTimeElement.classList.add("timer-stopped");
        cameraStatusElement.textContent = "Cámara: Activa • Temporizador: Finalizado";
    }
}

/* ==========================================================
   CALLBACK HOLISTIC
========================================================== */

function onResults(results) {
    if (!canvasCtx || !running) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (!results.poseLandmarks) {
        canvasCtx.restore();
        return;
    }

    let lm = results.poseLandmarks;
    smoothed = smoothLandmarks(lm);

    // SOLO POSE (no se dibuja la cara de face mesh)
    if (window.drawingUtils) {
        const draw = window.drawingUtils;
        draw.drawConnectors(canvasCtx, smoothed, Holistic.POSE_CONNECTIONS,
            { color: "#00E5FF", lineWidth: 3 });
        draw.drawLandmarks(canvasCtx, smoothed,
            { color: "#00FFFF", radius: 4 });
    }

    // Si seguía diciendo "Preparado..." cambia a algo más dinámico al primer frame
    if (feedbackTxt && feedbackTxt.textContent.includes("Preparado")) {
        feedbackTxt.textContent = "Empieza el movimiento cuando estés listo…";
    }

    if (EXERCISES[currentExercise]) {
        EXERCISES[currentExercise](smoothed);
    }

    canvasCtx.restore();
}

/* ==========================================================
   INICIALIZAR HOLISTIC HÍBRIDO
========================================================== */

function initHolistic() {
    if (typeof Holistic === "undefined") return;
    if (typeof Camera === "undefined") return;

    holistic = new Holistic({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });

    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: false,
        selfieMode: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
    });

    holistic.onResults(onResults);

    try {
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                if (!running || !holistic) return;

                frameCount++;

                // Procesar 1 de cada 2 frames → fluido y con buena respuesta
                if (frameCount % 2 !== 0) return;

                if (processingFrame) return;
                processingFrame = true;

                try {
                    await holistic.send({ image: videoElement });
                } catch (e) {
                    console.error("Error holistic.send:", e);
                } finally {
                    processingFrame = false;
                }
            },
            width: 480,
            height: 360,
        });

        camera.start();
    } catch (e) {
        console.error("Error iniciando la cámara:", e);
    }
}

/* ==========================================================
   CONTROLES
========================================================== */

function initControls() {
    const btnPausar = document.getElementById("btnPausar");
    const btnReanudar = document.getElementById("btnReanudar");
    const btnDetener = document.getElementById("btnDetener");

    if (btnPausar) btnPausar.onclick = () => pausarEjercicio("botón");
    if (btnReanudar) btnReanudar.onclick = () => reanudarEjercicio("botón");
    if (btnDetener) btnDetener.onclick = () => detenerEjercicio("botón");
}

/* ==========================================================
   CONTROL GLOBAL (BOTONES + VOZ)
========================================================== */

function pausarEjercicio(origen) {
    running = false;
    hiitRunning = false;

    actualizarEstadoTimer("paused");
    setFeedback("Ejercicio pausado ⏸");
}

function reanudarEjercicio(origen) {
    // Si el tiempo ya terminó, reiniciamos sesión
    if (hiitTimeLeft <= 0) {
        reiniciarSesion();
    }

    running = true;
    hiitRunning = true;
    actualizarEstadoTimer("running");

    // 🔥 Opción A: si el modal está abierto, se cierra aquí tanto para botón como para VOZ
    if (modalAbierto) {
        cerrarModalSalida();
    }

    setFeedback("Ejercicio reanudado ▶");
}

function detenerEjercicio(origen) {
    running = false;
    hiitRunning = false;

    actualizarEstadoTimer("stopped");
    mostrarModalSalida();
}

/* ==========================================================
   TEMPORIZADOR HIIT
========================================================== */

function initHIITTimer(reset = false) {
    if (!hiitTimeElement) return;

    if (hiitTimerInterval) clearInterval(hiitTimerInterval);

    if (reset) hiitTimeLeft = 30;

    hiitTimeElement.textContent = hiitTimeLeft;

    hiitTimerInterval = setInterval(() => {
        if (hiitRunning && hiitTimeLeft > 0) {
            hiitTimeLeft--;
            hiitTimeElement.textContent = hiitTimeLeft;

            if (hiitTimeLeft <= 0) {
                hiitTimeElement.textContent = "0";
                actualizarEstadoTimer("stopped");
                running = false;
                hiitRunning = false;

                setFeedback("¡Tiempo completado! 🎉");

                clearInterval(hiitTimerInterval);

                setTimeout(() => mostrarModalSalida(), 1200);
            }
        }
    }, 1000);
}

/* ==========================================================
   REINICIAR SESIÓN TRAS “SEGUIR”
========================================================== */

function reiniciarSesion() {
    hiitTimeLeft = 30;
    initHIITTimer(true);

    repCount = 0;
    score = 0;
    stateA = "start";

    if (repsTxt) repsTxt.textContent = "0";
    if (scoreTxt) scoreTxt.textContent = "0";
}
