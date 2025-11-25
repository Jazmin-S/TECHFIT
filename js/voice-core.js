// ==========================
//   SISTEMA GLOBAL DE VOZ
// ==========================

let globalVoiceActive = false;
let recognition = null;

// Comandos globales
const globalCommands = [
    { words: ["inicio", "home"], action: () => goTo("home.html") },
    { words: ["catálogo", "catalogo"], action: () => goTo("catalogo.html") },
    { words: ["perfil"], action: () => goTo("perfil.html") },
    { words: ["cerrar sesión", "logout", "salir"], action: () => goTo("index.html") },
    { words: ["abrir menú", "mostrar menú"], action: openMenu },
    { words: ["cerrar menú", "ocultar menú"], action: closeMenu },
    { words: ["subir"], action: () => window.scrollBy(0, -300) },
    { words: ["bajar"], action: () => window.scrollBy(0, 300) },
    { words: ["arriba"], action: () => window.scrollTo(0, 0) },
    { words: ["abajo"], action: () => window.scrollTo(0, document.body.scrollHeight) },
];

// Funciones auxiliares
function goTo(page) {
    window.location.href = page;
}

function openMenu() {
    const menu = document.querySelector(".menu");
    if (menu) menu.classList.add("open");
}

function closeMenu() {
    const menu = document.querySelector(".menu");
    if (menu) menu.classList.remove("open");
}

// Inicialización
function initVoiceCore() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        console.warn("Reconocimiento de voz no soportado");
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();

    recognition.continuous = true;
    recognition.lang = "es-MX";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log("🎤 Comando global:", result);

        for (const cmd of globalCommands) {
            if (cmd.words.some(w => result.includes(w))) {
                cmd.action();
                return;
            }
        }
    };

    recognition.onend = () => {
        if (globalVoiceActive) recognition.start();
    };
}

function startGlobalVoice() {
    if (globalVoiceActive) return;
    globalVoiceActive = true;
    recognition.start();
}

function stopGlobalVoice() {
    globalVoiceActive = false;
    recognition.stop();
}


// Inicia automáticamente en todas las páginas después de login:
document.addEventListener("DOMContentLoaded", () => {
    initVoiceCore();
    startGlobalVoice();
});

document.getElementById("btnVoiceChat").addEventListener("click", () => {
    if (!recognition) return;
    speakCoach("Te escucho...");
    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        addChatMessage("user", text);
        const reply = getCoachReply(text);
        addChatMessage("coach", reply);
        speakCoach(reply);
    };
});
