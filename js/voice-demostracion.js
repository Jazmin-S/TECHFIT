let recognition = null;
let globalVoiceActive = false;

// Cuando cargue la página iniciamos todo
document.addEventListener("DOMContentLoaded", () => {
    iniciarVoz();
    activarPanelComandos();
});

// Panel de comandos
function activarPanelComandos() {
    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    btn.addEventListener("click", () => {
        panel.classList.toggle("active");
    });
}

// Función para convertir instrucciones a voz
function leerInstrucciones() {
    const pasos = [...document.querySelectorAll("#lista-instrucciones li")]
        .map(li => li.textContent)
        .join(". ");

    const speech = new SpeechSynthesisUtterance(pasos);
    speech.lang = "es-MX";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

// Inicializar reconocimiento de voz
function iniciarVoz() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
        console.log("Reconocimiento de voz no disponible");
        return;
    }

    recognition = new SR();
    recognition.lang = "es-MX";
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const comando = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("🎤 Comando detectado:", comando);

        const params = new URLSearchParams(window.location.search);
        const ejercicioActual = params.get("ejercicio");
        const video = document.getElementById("video-ejercicio");

        // ---------------------------
        //   INICIAR EJERCICIO
        // ---------------------------
        if (comando.includes("iniciar ejercicio")) {
            window.location.href = `ejecucion.html?ejercicio=${ejercicioActual}`;
        }

        // ---------------------------
        //   REPRODUCIR VIDEO
        // ---------------------------
        if (comando.includes("reproducir video") || comando.includes("reproducir")) {
            if (video) video.play();
        }

        // ---------------------------
        //   PAUSAR VIDEO
        // ---------------------------
        if (comando.includes("pausar video") || comando.includes("pausa")) {
            if (video) video.pause();
        }

        // ---------------------------
        //   SUBIR VOLUMEN
        // ---------------------------
        if (comando.includes("subir volumen")) {
            if (video && video.volume < 1) {
                video.volume = Math.min(video.volume + 0.2, 1);
            }
        }

        // ---------------------------
        //   BAJAR VOLUMEN
        // ---------------------------
        if (comando.includes("bajar volumen")) {
            if (video && video.volume > 0) {
                video.volume = Math.max(video.volume - 0.2, 0);
            }
        }

        // ---------------------------
        //   EXPLICAR EJERCICIO
        // ---------------------------
        if (comando.includes("explicar ejercicio") || comando.includes("explicación")) {
            leerInstrucciones();
        }

        // ---------------------------
        //   SALIR
        // ---------------------------
        if (comando.includes("salir")) {
            window.location.href = "catalogo.html";
        }
    };

    recognition.onend = () => {
        if (globalVoiceActive) recognition.start();
    };

    globalVoiceActive = true;
    recognition.start();
}
