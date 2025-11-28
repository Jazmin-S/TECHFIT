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
   NORMALIZAR NOMBRE DE EJERCICIO Y ALIAS
========================================================== */

function normalizarTexto(txt) {
    return (txt || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .replace(/_/g, "");
}

function mapearEjercicio(rawName) {
    const key = normalizarTexto(rawName);

    const alias = {
        // Catálogo principal
        "sentadillas": "sentadillas",
        "desplantes": "desplantes",
        "elevacionesbrazo": "elevaciones_brazo",
        "flexionespared": "flexiones_pared",
        "plancha": "plancha",
        "elevacionrodillas": "rodillas",
        "rodillas": "rodillas",
        "jumping": "jumping",
        "jumpingjacks": "jumping",
        "elevacioneslateralesdepierna": "pierna",
        "puentedegluteo": "glute_bridge",
        "glutebridge": "glute_bridge",
        "remoconbanda": "remo_banda",
        "remobanda": "remo_banda",
        "elevaciondetalones": "talones",
        "talones": "talones",
        "estiramientocuello": "estiramiento_cuello",
        "cuello": "estiramiento_cuello",
        // Algunos alias extra por si cambias títulos
        "squat": "sentadillas",
        "lunges": "desplantes",
        "plank": "plancha"
    };

    return alias[key] || rawName; // si no se encuentra, se deja tal cual
}

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

function initApp() {
    // Parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const rawExercise = (params.get("ejercicio") || "").trim();
    currentExercise = mapearEjercicio(rawExercise);

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

    // Mostrar nombre de ejercicio en el título si existe
    if (rawExercise) {
        const nombreEjercicio = document.getElementById("nombre-ejercicio");
        if (nombreEjercicio) nombreEjercicio.textContent = rawExercise;
    }

    actualizarEstadoTimer("running");

    initControls();
    initHIITTimer(true);
    initHolistic();

    const seguirBtn = document.getElementById("seguirBtn");
    const salirBtn = document.getElementById("salirBtn");

    if (seguirBtn) {
        seguirBtn.onclick = () => {
            reanudarEjercicio("botón");
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

    if (magAB === 0 || magCB === 0) return 0;

    let cos = dot / (magAB * magCB);
    cos = Math.min(1, Math.max(-1, cos));
    return Math.acos(cos) * 180 / Math.PI;
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

/* -------- Sentadillas -------- */
function sentadillas(lm) {
    const hip = lm[23], knee = lm[25], ankle = lm[27];
    if (!hip || !knee || !ankle) return;

    const kneeAng = angle(hip, knee, ankle);

    if (kneeAng < 120 && stateA === "start") {
        stateA = "down";
        setFeedback("Bien bajado ✔");
    }
    if (kneeAng > 165 && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición completa 🔥 +10pts");
    }
}

/* -------- Desplantes -------- */
function desplantes(lm) {
    // Usamos lado izquierdo como pierna frontal
    const hip = lm[23], knee = lm[25], ankle = lm[27];
    if (!hip || !knee || !ankle) return;

    const kneeAng = angle(hip, knee, ankle);
    const forward = ankle.x < hip.x - 0.02; // pierna un poco adelantada

    if (forward && kneeAng < 120 && stateA === "start") {
        stateA = "down";
        setFeedback("Baja el desplante ✔");
    }
    if (kneeAng > 165 && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Buen desplante 🔥 +10pts");
    }
}

/* -------- Elevaciones de brazo -------- */
function elevaciones_brazo(lm) {
    const shoulder = lm[11], elbow = lm[13], wrist = lm[15];
    if (!shoulder || !elbow || !wrist) return;

    const ang = angle(shoulder, elbow, wrist);

    if (ang > 140 && stateA === "start") {
        stateA = "up";
        setFeedback("Brazo arriba ✔");
    }
    if (ang < 100 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥 +10pts");
    }
}

/* -------- Flexiones de pared -------- */
function flexiones_pared(lm) {
    const nose = lm[0];
    const shoulder = lm[11];

    if (!nose || !shoulder) return;

    const d = Math.abs(nose.z - shoulder.z);

    const acercado = d < 0.08;
    const alejado = d > 0.13;

    if (acercado && stateA === "start") {
        stateA = "down";
        setFeedback("Acércate a la pared ✔");
    }
    if (alejado && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Flexión de pared completa 🔥 +10pts");
    }
}

/* -------- Plancha con repeticiones (tipo flexiones) -------- */
function plancha(lm) {
    const shoulder = lm[11], elbow = lm[13], wrist = lm[15];
    if (!shoulder || !elbow || !wrist) return;

    const angElbow = angle(shoulder, elbow, wrist);

    // Arriba (casi extendido)
    if (angElbow > 160 && stateA === "start") {
        stateA = "up";
        setFeedback("Cuerpo alineado ✔");
    }
    // Bajando (flexiona codo)
    if (angElbow < 120 && stateA === "up") {
        stateA = "down";
        setFeedback("Baja controlado");
    }
    // Regresa arriba
    if (angElbow > 160 && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición de plancha completa 🔥 +10pts");
    }
}

/* -------- Elevación de rodillas -------- */
function rodillas(lm) {
    const hip = lm[23], knee = lm[25];
    if (!hip || !knee) return;

    const diff = hip.y - knee.y;

    if (diff < -0.02 && stateA === "start") {
        stateA = "up";
        setFeedback("Rodilla arriba ✔");
    }
    if (diff > -0.005 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Bien hecho 🔥 +10pts");
    }
}

/* -------- Jumping jacks -------- */
function jumping(lm) {
    const lAnkle = lm[27], rAnkle = lm[28];
    if (!lAnkle || !rAnkle) return;

    const d = dist(lAnkle, rAnkle);

    if (d > 0.22 && stateA === "start") {
        stateA = "open";
        setFeedback("Piernas abiertas ✔");
    }
    if (d < 0.12 && stateA === "open") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥 +10pts");
    }
}

/* -------- Elevaciones laterales de pierna -------- */
function pierna(lm) {
    const hip = lm[23], ankle = lm[27];
    if (!hip || !ankle) return;

    const diff = hip.x - ankle.x;

    if (diff < -0.04 && stateA === "start") {
        stateA = "up";
        setFeedback("Pierna hacia afuera ✔");
    }
    if (diff > -0.015 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥 +10pts");
    }
}

/* -------- Puente de glúteo -------- */
function glute_bridge(lm) {
    const hip = lm[23], knee = lm[25];
    if (!hip || !knee) return;

    const diff = hip.y - knee.y;

    if (diff < -0.025 && stateA === "start") {
        stateA = "up";
        setFeedback("Cadera arriba ✔");
    }
    if (diff > -0.005 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥 +10pts");
    }
}

/* -------- Remo con banda -------- */
function remo_banda(lm) {
    const shoulder = lm[11], elbow = lm[13];
    if (!shoulder || !elbow) return;

    const ang = angle(
        { x: shoulder.x - 0.1, y: shoulder.y, z: shoulder.z },
        shoulder,
        elbow
    );

    if (ang < 120 && stateA === "start") {
        stateA = "pull";
        setFeedback("Jala la banda ✔");
    }
    if (ang > 155 && stateA === "pull") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición de remo 🔥 +10pts");
    }
}

/* -------- Elevación de talones -------- */
function talones(lm) {
    const hip = lm[23], ankle = lm[27];
    if (!hip || !ankle) return;

    const diff = hip.y - ankle.y;

    if (diff > 0.07 && stateA === "start") {
        stateA = "up";
        setFeedback("Ponte de puntillas ✔");
    }
    if (diff < 0.045 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Elevación de talones correcta 🔥 +10pts");
    }
}

/* -------- Estiramiento de cuello -------- */
function estiramiento_cuello(lm) {
    const leftEar = lm[7];
    const rightEar = lm[8];

    if (!leftEar || !rightEar) return;

    const diff = leftEar.y - rightEar.y;

    if (diff > 0.015 && stateA === "start") {
        stateA = "left";
        setFeedback("Inclina la cabeza a la derecha →");
    }
    if (diff < -0.015 && stateA === "start") {
        stateA = "right";
        setFeedback("Inclina la cabeza a la izquierda ←");
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
    desplantes,
    elevaciones_brazo,
    flexiones_pared,
    plancha,
    rodillas,
    jumping,
    pierna,
    glute_bridge,
    remo_banda,
    talones,
    estiramiento_cuello
};

/* ==========================================================
   DIBUJAR ESQUELETO GUÍA EN EL CANVAS
========================================================== */

function dibujarEsqueletoGUIA(lm) {
    if (!canvasCtx || !canvasElement || !lm) return;

    const ctx = canvasCtx;

    function p(i) {
        const pt = lm[i];
        if (!pt) return null;
        return {
            x: pt.x * canvasElement.width,
            y: pt.y * canvasElement.height
        };
    }

    function seg(i, j) {
        const a = p(i);
        const b = p(j);
        if (!a || !b) return;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#00E5FF";
        ctx.stroke();
    }

    // Tronco
    seg(11, 12);
    seg(11, 23);
    seg(12, 24);
    seg(23, 24);

    // Brazo izquierdo
    seg(11, 13);
    seg(13, 15);

    // Brazo derecho
    seg(12, 14);
    seg(14, 16);

    // Pierna izquierda
    seg(23, 25);
    seg(25, 27);

    // Pierna derecha
    seg(24, 26);
    seg(26, 28);

    // Cabeza
    const head = p(0);
    if (head) {
        ctx.beginPath();
        ctx.arc(head.x, head.y - 10, 10, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00FFFF";
        ctx.stroke();
    }

    // Puntos clave
    ctx.fillStyle = "#00FFFF";
    const indicesPuntos = [0, 11, 12, 23, 24, 25, 26, 27, 28, 13, 14, 15, 16];
    indicesPuntos.forEach(i => {
        const pt = p(i);
        if (!pt) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

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

    // Esqueleto guía
    if (window.drawingUtils && window.Holistic && Holistic.POSE_CONNECTIONS) {
        const draw = window.drawingUtils;
        draw.drawConnectors(canvasCtx, smoothed, Holistic.POSE_CONNECTIONS,
            { color: "#00E5FF", lineWidth: 3 });
        draw.drawLandmarks(canvasCtx, smoothed,
            { color: "#00FFFF", radius: 4 });
    } else {
        dibujarEsqueletoGUIA(smoothed);
    }

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
        minTrackingConfidence: 0.3
    });

    holistic.onResults(onResults);

    try {
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                if (!running || !holistic) return;

                frameCount++;
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
            height: 360
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
    if (hiitTimeLeft <= 0) {
        reiniciarSesion();
    }

    running = true;
    hiitRunning = true;
    actualizarEstadoTimer("running");

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
                hiitTimeLeft = 0;
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
