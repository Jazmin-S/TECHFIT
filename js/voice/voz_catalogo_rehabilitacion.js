// =====================================================
//   VOZ DEMOSTRACIÓN REHABILITACIÓN
//   Comandos:
//     - "iniciar ejercicio"
//     - "pausar video" / "reproducir video"
//     - "salir"
// =====================================================

(function () {

    // Solo ejecutar en la página de demostración
    const tituloDemo = document.getElementById("titulo-ejercicio");
    const video = document.getElementById("video-ejercicio");
    const btnIniciar = document.getElementById("btnIniciar");

    if (!tituloDemo || !video || !btnIniciar) {
        console.warn("voz_demostracion_rehab.js: no es la página de demostración, se omite.");
        return;
    }

    if (!window.infoRehab) {
        console.warn("voz_demostracion_rehab.js: infoRehab no está disponible.");
    }

    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn("Este navegador no soporta reconocimiento de voz.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;

    let escuchando = false;

    function iniciarEscucha() {
        if (!escuchando) {
            try {
                recognition.start();
                escuchando = true;
                console.log("🎤 Reconocimiento de voz iniciado (rehab).");
            } catch (e) {
                console.warn("No se pudo iniciar reconocimiento:", e);
            }
        }
    }

    function detenerEscucha() {
        if (escuchando) {
            recognition.stop();
            escuchando = false;
            console.log("🎤 Reconocimiento de voz detenido (rehab).");
        }
    }

    // Obtener ejercicio actual
    function obtenerEjercicioActual() {
        const q = new URLSearchParams(window.location.search);
        const ej = q.get("ejercicio");
        if (!window.infoRehab) return null;
        return window.infoRehab[ej] || null;
    }

    function procesarComando(texto) {
        const comando = texto.toLowerCase();
        console.log("🗣 Comando detectado:", comando);

        // Iniciar ejercicio (ir a ejecución)
        if (comando.includes("iniciar ejercicio")) {
            btnIniciar.click();
            return;
        }

        // Pausar / reproducir video
        if (comando.includes("pausar") || comando.includes("poner pausa")) {
            video.pause();
            return;
        }

        if (comando.includes("reproducir") || comando.includes("reanudar") || comando.includes("play")) {
            video.play();
            return;
        }

        // Salir (regresar al catálogo)
        if (comando.includes("salir")) {
            window.location.href = "/pages/Catalogos/catalogo_rehabilitacion.html";
            return;
        }
    }

    recognition.onresult = (event) => {
        const results = event.results;
        const last = results[results.length - 1];
        const texto = last[0].transcript.trim();
        procesarComando(texto);
    };

    recognition.onerror = (event) => {
        console.warn("Error en reconocimiento de voz:", event.error);
        // Si se cortó, intentar reanudar para que quede siempre activo
        if (event.error === "no-speech" || event.error === "network") {
            detenerEscucha();
            setTimeout(iniciarEscucha, 1000);
        }
    };

    recognition.onend = () => {
        // Mantener siempre escuchando
        if (escuchando) {
            setTimeout(iniciarEscucha, 300);
        }
    };

    // Iniciar automáticamente al cargar la página
    window.addEventListener("load", () => {
        iniciarEscucha();
    });

})();
