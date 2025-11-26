let globalVoiceActive = false;
let recognition = null;

// Lista de ejercicios y rutas
const ejerciciosVoz = {
    "sentadillas": "demostracion.html?ejercicio=sentadillas",
    "desplantes": "demostracion.html?ejercicio=desplantes",
    "elevaciones de brazo": "demostracion.html?ejercicio=elevaciones_brazo",
    "flexiones de pared": "demostracion.html?ejercicio=flexiones_pared",
    "plancha": "demostracion.html?ejercicio=plancha",
    "elevación de rodillas": "demostracion.html?ejercicio=rodillas",
    "jumping jacks": "demostracion.html?ejercicio=jumping",
    "elevaciones laterales de pierna": "demostracion.html?ejercicio=pierna"
};

function initVoiceCore() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        console.log("Voz no soportada");
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Comando:", result);

        // ----------- COMANDOS DE MENÚ -----------
        if (result.includes("abrir menú")) sidebar.classList.add("active");
        if (result.includes("cerrar menú")) sidebar.classList.remove("active");

        if (result.includes("perfil")) window.location.href = "perfil.html";
        if (result.includes("cerrar sesión") || result.includes("inicio")) window.location.href = "../index.html";

        if (result.includes("subir")) window.scrollBy(0, -300);
        if (result.includes("bajar")) window.scrollBy(0, 300);

        // ----------- 🟦 NUEVO: INICIAR EJERCICIO -----------
        if (result.includes("iniciar ejercicio")) {
            for (let nombre in ejerciciosVoz) {
                if (result.includes(nombre)) {
                    window.location.href = ejerciciosVoz[nombre];
                    return;
                }
            }
        }
    };

    recognition.onend = () => {
        if (globalVoiceActive) recognition.start();
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initVoiceCore();
    globalVoiceActive = true;
    recognition.start();
});
