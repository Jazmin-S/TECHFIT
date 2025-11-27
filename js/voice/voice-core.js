let globalVoiceActive = false;
let recognition = null;
let esperandoConfirmacionSalida = false;


// ---------------------------------------------------
// EJERCICIOS CON RUTAS ABSOLUTAS
// ---------------------------------------------------
const ejerciciosVoz = {
    "sentadillas": "/pages/demostracion.html?ejercicio=sentadillas",
    "desplantes": "/pages/demostracion.html?ejercicio=desplantes",
    "elevaciones de brazo": "/pages/demostracion.html?ejercicio=elevaciones_brazo",
    "flexiones de pared": "/pages/demostracion.html?ejercicio=flexiones_pared",
    "plancha": "/pages/demostracion.html?ejercicio=plancha",
    "elevación de rodillas": "/pages/demostracion.html?ejercicio=rodillas",
    "jumping jacks": "/pages/demostracion.html?ejercicio=jumping",
    "puente de gluteo": "/pages/demostracion.html?ejercicio=glute_bridge",
    "elevaciones laterales de pierna": "/pages/demostracion.html?ejercicio=pierna",
    "remo con banda": "/pages/demostracion.html?ejercicio=remo_banda",
    "elevaciones de talones": "/pages/demostracion.html?ejercicio=talones",
    "estiramiento de cuello": "/pages/demostracion.html?ejercicio=estiramiento_cuello"
};

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// ---------------------------------------------------
// INICIALIZAR VOZ (CATÁLOGO / MENÚ)
// ---------------------------------------------------
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
        let result = event.results[event.results.length - 1][0].transcript;
        result = normalizar(result);

        console.log("🎤 Comando:", result);

        // ---------------------------
        // MENÚ
        // ---------------------------
        if (result.includes("abrir menu")) sidebar.classList.add("active");
        if (result.includes("cerrar menu")) sidebar.classList.remove("active");

        // ---------------------------
        // PERFIL
        // ---------------------------
        if (result.includes("perfil")) {
            window.location.href = "/pages/perfil.html";
        }

        // ---------------------------
        // CERRAR SESIÓN
        // ---------------------------
        if (result.includes("cerrar sesion")) {
            window.location.href = "/index.html";
        }

        // ---------------------------
        // SCROLL
        // ---------------------------
        if (result.includes("subir")) window.scrollBy(0, -300);
        if (result.includes("bajar")) window.scrollBy(0, 300);

        // ---------------------------
        // INICIAR EJERCICIO
        // ---------------------------
        if (result.includes("iniciar ejercicio")) {
            for (let nombre in ejerciciosVoz) {
                if (result.includes(normalizar(nombre))) {
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
