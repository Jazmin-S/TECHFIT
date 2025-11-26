// =======================================================
//  VOZ PARA EJECUCIÓN – FILTROS EXACTOS + MODOS + MOTIVACIÓN
// =======================================================

let recognitionEj = null;
let voiceActiveEj = true;
let vozHablando = true;
let modoActual = "normal";

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("voiceHelpBtn");
    const panel = document.getElementById("voiceCommandsPanel");

    btn.addEventListener("click", () => {
        panel.classList.toggle("active");
    });

    initVoiceExecution();
});

// --------- UTILIDADES DE VOZ ---------
function speak(text) {
    if (!vozHablando) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-MX";
    utter.pitch = 1;
    utter.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

function getMotivation() {
    const frases = [
        "¡Lo estás haciendo increíble!",
        "Mantén el ritmo, mi pequeño Sarmiento.",
        "Muy bien, tu postura está mejor.",
        "No te rindas, tú puedes.",
        "Eres más fuerte de lo que crees.",
        "Excelente trabajo, sigue así.",
        "Respira y controla el movimiento.",
        "¡Vamos! Yo creo en ti."
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

// --------- SISTEMA DE MODOS ---------
function activarModo(modo) {
    document.body.classList.remove(
        "modo-intenso",
        "modo-recuperativo",
        "modo-nocturno",
        "modo-power"
    );

    modoActual = modo;

    switch (modo) {
        case "intenso":
            document.body.classList.add("modo-intenso");
            vozHablando = true;
            speak("Modo intenso activado.");
            break;

        case "recuperativo":
            document.body.classList.add("modo-recuperativo");
            vozHablando = true;
            speak("Modo recuperativo activado.");
            break;

        case "nocturno":
            document.body.classList.add("modo-nocturno");
            vozHablando = true;
            speak("Modo nocturno activado.");
            break;

        case "silencioso":
            vozHablando = false;
            window.speechSynthesis.cancel();
            break;

        case "normal":
            vozHablando = true;
            speak("Modo normal activado.");
            break;

        case "power":
            document.body.classList.add("modo-power");
            vozHablando = true;
            speak("Modo Power Coach activado. ¡Vamos con todo!");
            break;
    }
}

// --------- INICIALIZAR RECONOCIMIENTO ---------
function initVoiceExecution() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    recognitionEj = new SR();
    recognitionEj.lang = "es-MX";
    recognitionEj.continuous = true;
    recognitionEj.interimResults = false;

    recognitionEj.onresult = (event) => {
        let comando = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();

        // Limpieza
        comando = comando
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/gi, "")
            .trim();

        console.log("🎤 Comando detectado:", comando);

        // COMANDOS EXACTOS
        const comandosAceptados = {
            "pausar": "pausar",
            "pausa": "pausar",
            "reanudar": "reanudar",
            "seguir": "reanudar",
            "continuar": "reanudar",
            "detener": "detener",
            "finalizar": "detener",
            "parar": "detener",
            "tiempo": "tiempo",
            "subir volumen": "subir-volumen",
            "bajar volumen": "bajar-volumen",
            "salir": "salir",
            "modo intenso": "intenso",
            "modo recuperativo": "recuperativo",
            "modo nocturno": "nocturno",
            "modo oscuro": "nocturno",
            "modo silencioso": "silencioso",
            "modo normal": "normal",
            "modo power": "power",
            "power coach": "power"
        };

        let accion = comandosAceptados[comando];
        if (!accion) return; // comando inválido → IGNORAR

        const video = document.getElementById("video");
        const timer = document.getElementById("timer").textContent;
        const reps = document.getElementById("hud-reps").textContent;
        const score = document.getElementById("hud-score").textContent;

        // EJECUCIÓN DE COMANDOS EXACTOS
        switch (accion) {
            case "pausar":
                if (typeof pauseTraining === "function") pauseTraining(true);
                speak("Ejercicio pausado.");
                break;

            case "reanudar":
                if (typeof resumeTraining === "function") resumeTraining(true);
                speak("Continuamos.");
                break;

            case "detener":
                if (typeof stopTraining === "function") stopTraining(true);
                speak("Ejercicio detenido.");
                break;

            case "tiempo":
                speak("Tiempo actual: " + timer);
                break;

            case "subir-volumen":
                if (video) video.volume = Math.min(video.volume + 0.2, 1);
                speak("Volumen aumentado.");
                break;

            case "bajar-volumen":
                if (video) video.volume = Math.max(video.volume - 0.2, 0);
                speak("Volumen disminuido.");
                break;

            case "salir":
                speak("Saliendo.");
                window.location.href = "catalogo.html";
                break;

            // MODOS
            case "intenso":
            case "recuperativo":
            case "nocturno":
            case "silencioso":
            case "normal":
            case "power":
                activarModo(accion);
                break;
        }
    };

    recognitionEj.onend = () => {
        if (voiceActiveEj) recognitionEj.start();
    };

    recognitionEj.start();
    speak("Comandos activados.");
}
