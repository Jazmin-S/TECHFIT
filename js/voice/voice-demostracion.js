let recognition = null;
let globalVoiceActive = false;

document.addEventListener("DOMContentLoaded", () => {
    iniciarVozDemostracion();
    activarPanelComandosDemostracion();
});

// --------------------------------------------
// PANEL DE COMANDOS
// --------------------------------------------
function activarPanelComandosDemostracion() {
    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    btn.addEventListener("click", () => {
        panel.classList.toggle("active");
    });
}

// --------------------------------------------
// LEER INSTRUCCIONES EN VOZ
// --------------------------------------------
function leerInstrucciones() {
    const pasos = [...document.querySelectorAll("#lista-instrucciones li")]
        .map(li => li.textContent)
        .join(". ");

    const speech = new SpeechSynthesisUtterance(pasos);
    speech.lang = "es-MX";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

// --------------------------------------------
// ACTIVAR RECONOCIMIENTO DE VOZ
// --------------------------------------------
function iniciarVozDemostracion() {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
        console.log("API de voz NO disponible");
        return;
    }

    recognition = new SR();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const comando = event.results[event.results.length - 1][0].transcript
            .toLowerCase()
            .trim();

        console.log("🎤 Comando detectado:", comando);

        const params = new URLSearchParams(window.location.search);
        const ejercicioActual = params.get("ejercicio");

        const video = document.getElementById("video-ejercicio");

        // ---------------------------
        if (comando.includes("iniciar ejercicio")) {
            window.location.href = `../pages/ejecucion.html?ejercicio=${ejercicioActual}`;
        }

        if (comando.includes("reproducir")) video.play();
        if (comando.includes("pausar")) video.pause();

        if (comando.includes("subir volumen"))
            video.volume = Math.min(video.volume + 0.2, 1);

        if (comando.includes("bajar volumen"))
            video.volume = Math.max(video.volume - 0.2, 0);

        if (comando.includes("explicar"))
            leerInstrucciones();

        if (comando.includes("salir"))
            window.location.href = "../pages/Catalogos/catalogo.html";
    };

    recognition.onend = () => {
        if (globalVoiceActive) recognition.start();
    };

    globalVoiceActive = true;
    recognition.start();
}
