/* ==========================================================
   TECHFIT — HOLISTIC PRO COMPLETO
========================================================== */
let modalAbierto = false;

function mostrarModalSalida() {
    const modal = document.getElementById("exitModal");
    modal.classList.remove("hidden");
    modalAbierto = true;

    try { speak("¿Deseas continuar o salir?"); } catch(e){}
}

function cerrarModalSalida() {
    const modal = document.getElementById("exitModal");
    modal.classList.add("hidden");
    modalAbierto = false;
}

// Variables globales
var holistic = null;
var videoElement, canvasElement, canvasCtx;
var running = true;
var repCount = 0;
var score = 0;
var stateA = "start";
var currentExercise = null;
var smoothed = null;

// Elementos UI
var feedbackTxt, repsTxt, scoreTxt;

/* ==========================================================
   INICIALIZACIÓN
========================================================== */

function initApp() {
    // Obtener parámetros de URL
    const params = new URLSearchParams(window.location.search);
    currentExercise = params.get("ejercicio");
    
    // Inicializar elementos UI
    feedbackTxt = document.getElementById("feedback");
    repsTxt = document.getElementById("hud-reps");
    scoreTxt = document.getElementById("hud-score");
    
    // Inicializar elementos de video
    videoElement = document.getElementById("video");
    canvasElement = document.getElementById("poseCanvas");
    canvasCtx = canvasElement.getContext("2d");
    
    // Configurar canvas
    canvasElement.width = 640;
    canvasElement.height = 480;
    
    // Inicializar controles
    initControls();

    initHIITTimer();
    
    // Inicializar Holistic
    initHolistic();
    
    // Mostrar ejercicio actual
    if (currentExercise) {
        const nombreEjercicio = document.getElementById("nombre-ejercicio");
        if (nombreEjercicio) {
            nombreEjercicio.textContent = currentExercise;
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const seguirBtn = document.getElementById("seguirBtn");
    const salirBtn = document.getElementById("salirBtn");

    seguirBtn.onclick = () => {
        cerrarModalSalida();
        running = true;
        setFeedback("Continuamos");
        try { speak("Perfecto, continuamos."); } catch(e){}
    };

    salirBtn.onclick = () => {
        try { speak("Saliendo del ejercicio."); } catch(e){}
        window.location.href = "/pages/Catalogos/catalogo.html";
    };
});



/* ==========================================================
   SUAVIZADO EMA
========================================================== */
function smoothLandmarks(raw, alpha = 0.4) {
    if (!smoothed) return raw;

    for (let i = 0; i < raw.length; i++) {
        smoothed[i].x = smoothed[i].x * (1 - alpha) + raw[i].x * alpha;
        smoothed[i].y = smoothed[i].y * (1 - alpha) + raw[i].y * alpha;
        smoothed[i].z = smoothed[i].z * (1 - alpha) + raw[i].z * alpha;
    }

    return smoothed;
}

/* ==========================================================
   UTILIDADES
========================================================== */

function setFeedback(msg) {
    if (feedbackTxt) feedbackTxt.textContent = msg;

    // --- INTEGRAR VOZ DE RETROALIMENTACIÓN ---
    try {
        // Función speak() viene de voice-ejecucion.js
        if (typeof speak === "function") {
            speak(msg);
        }
    } catch (e) {
        console.warn("Error al reproducir retroalimentación por voz:", e);
    }
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
   EJERCICIOS
========================================================== */

function sentadillas(lm) {
    const hip = lm[23], knee = lm[25], ankle = lm[27];
    if (!hip) return;

    const kneeAng = angle(hip, knee, ankle);

    if (kneeAng < 95 && stateA === "start") {
        stateA = "down";
        setFeedback("Bien bajado ✔");
    }
    if (kneeAng > 160 && stateA === "down") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición completa 🔥");
    }
}

function elevaciones_brazo(lm) {
    const shoulder = lm[11], elbow = lm[13], wrist = lm[15];
    if (!shoulder) return;

    const ang = angle(shoulder, elbow, wrist);

    if (ang > 150 && stateA === "start") {
        stateA = "up";
        setFeedback("Brazo arriba ✔");
    }
    if (ang < 80 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥");
    }
}

function rodillas(lm) {
    const hip = lm[23], knee = lm[25];
    if (!hip) return;

    const diff = hip.y - knee.y;

    if (diff < -0.03 && stateA === "start") {
        stateA = "up";
        setFeedback("Rodilla arriba ✔");
    }
    if (diff > -0.01 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Bien hecho 🔥");
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
        setFeedback("Repetición correcta 🔥");
    }
}

function pierna(lm) {
    const hip = lm[23], ankle = lm[27];
    const diff = hip.x - ankle.x;

    if (diff < -0.05 && stateA === "start") {
        stateA = "up";
        setFeedback("Arriba ✔");
    }
    if (diff > -0.02 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥");
    }
}

function glute_bridge(lm) {
    const hip = lm[23], knee = lm[25];
    const diff = hip.y - knee.y;

    if (diff < -0.03 && stateA === "start") {
        stateA = "up";
        setFeedback("Cadera arriba ✔");
    }
    if (diff > -0.01 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥");
    }
}

function remo_banda(lm) {
    const shoulder = lm[11], elbow = lm[13];
    const ang = angle({ x: shoulder.x - 0.1, y: shoulder.y, z: shoulder.z }, shoulder, elbow);

    if (ang < 110 && stateA === "start") {
        stateA = "pull";
        setFeedback("Jala fuerte ✔");
    }
    if (ang > 150 && stateA === "pull") {
        rep(true);
        stateA = "start";
        setFeedback("Repetición correcta 🔥");
    }
}

function elevacion_talones(lm) {
    const hip = lm[23], ankle = lm[27];
    const diff = hip.y - ankle.y;

    if (diff > 0.08 && stateA === "start") {
        stateA = "up";
        setFeedback("Arriba ✔");
    }
    if (diff < 0.04 && stateA === "up") {
        rep(true);
        stateA = "start";
        setFeedback("Correcto 🔥");
    }
}

function estiramiento_cuello(lm) {
    const leftEar = lm[7];
    const rightEar = lm[8];

    const diff = leftEar.y - rightEar.y;

    if (diff > 0.03) {
        setFeedback("Inclina un poco →");
    } else if (diff < -0.03) {
        setFeedback("← Inclina un poco");
    } else {
        setFeedback("Postura correcta ✔");
    }
}

/* ==========================================================
   MAPEADOR DE EJERCICIOS
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
   CALLBACK HOLISTIC
========================================================== */

function onResults(results) {
    if (!canvasCtx || !running) return;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Dibujar video
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (!results.poseLandmarks) {
        canvasCtx.restore();
        return;
    }

    let lm = results.poseLandmarks;
    smoothed = smoothed ? smoothLandmarks(lm) : lm;

    // Dibujar landmarks y conexiones
    if (window.drawingUtils) {
        const draw = window.drawingUtils;
        draw.drawConnectors(canvasCtx, smoothed, Holistic.POSE_CONNECTIONS,
            { color: "#00E5FF", lineWidth: 3 });
        draw.drawLandmarks(canvasCtx, smoothed,
            { color: "#00FFFF", radius: 4 });
    }

    // Ejecutar ejercicio actual
    if (EXERCISES[currentExercise]) {
        EXERCISES[currentExercise](smoothed);
    }

    canvasCtx.restore();
}

/* ==========================================================
   INICIALIZAR HOLISTIC
========================================================== */

function initHolistic() {
    // Verificar dependencias
    if (typeof Holistic === 'undefined') {
        console.error('Holistic no está cargado');
        return;
    }
    
    if (typeof Camera === 'undefined') {
        console.error('Camera utils no está cargado');
        return;
    }

    // Crear instancia de Holistic
    holistic = new Holistic({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
    });

    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    // Inicializar cámara
    try {
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                if (running && holistic) {
                    await holistic.send({ image: videoElement });
                }
            },
            width: 640,
            height: 480,
        });
        camera.start();
    } catch (error) {
        console.error('Error al iniciar cámara:', error);
    }
}

/* ==========================================================
   INICIO DE LA APLICACIÓN
========================================================== */

// Esperar a que todo esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/* ==========================================================
   CONTROLES DE EJERCICIO
========================================================== */

function initControls() {
    const btnPausar = document.getElementById('btnPausar');
    const btnReanudar = document.getElementById('btnReanudar');
    const btnDetener = document.getElementById('btnDetener');

    if (btnPausar) {
        btnPausar.addEventListener('click', function() {
            running = false;
            setFeedback("Ejercicio pausado ⏸");
        });
    }

    if (btnReanudar) {
        btnReanudar.addEventListener('click', function() {
            running = true;
            setFeedback("Ejercicio reanudado ▶");
        });
    }

    if (btnDetener) {
    btnDetener.addEventListener('click', function() {
        running = false;
        mostrarModalSalida();
    });
}

}

/* ==========================================================
   EJERCICIOS ACTUALIZADOS (CON CONTEO DE REPS)
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

/* ==========================================================
   ESTIRAMIENTO DE CUELLO - VERSIÓN CON REPETICIONES
========================================================== */

function estiramiento_cuello(lm) {
    const leftEar = lm[7];
    const rightEar = lm[8];
    const nose = lm[0];

    if (!leftEar || !rightEar || !nose) return;

    const diff = leftEar.y - rightEar.y;

    if (diff > 0.03 && stateA === "start") {
        stateA = "left";
        setFeedback("Inclina a la derecha →");
    }
    if (diff < -0.03 && stateA === "start") {
        stateA = "right";
        setFeedback("Inclina a la izquierda ←");
    }
    if (Math.abs(diff) < 0.02 && (stateA === "left" || stateA === "right")) {
        rep(true);
        stateA = "start";
        setFeedback("Estiramiento completo 🔥 +10pts");
    }
}
/* ==========================================================
   TEMPORIZADOR HIIT
========================================================== */

function initHIITTimer() {
    const hiitTimeElement = document.getElementById("hiit-time");
    const hiitLabelElement = document.getElementById("hiit-label");
    
    if (!hiitTimeElement) return;
    
    let timeLeft = 30;
    const timerInterval = setInterval(() => {
        if (running) {
            timeLeft--;
            hiitTimeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
    clearInterval(timerInterval);
    running = false;

    setFeedback("Tiempo completado");

    setTimeout(() => {
        mostrarModalSalida();
    }, 500);

    return;
}


        }
    }, 1000);
}