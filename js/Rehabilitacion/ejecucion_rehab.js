// js/Rehabilitacion/ejecucion_rehab.js
// Maneja título, timer, botones, modal y abre la cámara.

(function () {
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    // ---- Leer ejercicio de la URL ----
    const params = new URLSearchParams(window.location.search);
    const ej = params.get("ejercicio") || "";

    const nombres = {
      hombro_banda: "Movilidad de hombro con banda",
      elevacion_pierna_rehab: "Elevación de pierna acostado",
      caminata_banda: "Caminata lateral con banda",
      rodilla_rehab: "Extensión de rodilla",
      lumbar: "Estiramiento lumbar",
      tobillo_rehab: "Movilidad de tobillo",
    };

    const titulo = document.getElementById("titulo-ejercicio");
    const inputEj = document.getElementById("ejercicio-actual");
    if (titulo) titulo.textContent = nombres[ej] || "Ejercicio de rehabilitación";
    if (inputEj) inputEj.value = ej;

    // ---- Referencias UI ----
    const video = document.getElementById("video");
    const repsSpan = document.getElementById("reps");
    const tiempoSpan = document.getElementById("tiempo");
    const estadoSpan = document.getElementById("estado");
    const feedbackDiv = document.getElementById("feedback");
    const hiitTimeSpan = document.getElementById("hiit-time");
    const hiitPhaseSpan = document.getElementById("hiit-phase");

    const btnIniciar = document.getElementById("btnIniciarEj");
    const btnPausar = document.getElementById("btnPausarEj");
    const btnReiniciar = document.getElementById("btnReiniciarEj");
    const btnSalir = document.getElementById("btnSalirEj");

    const exitModal = document.getElementById("exitModal");
    const seguirBtn = document.getElementById("seguirBtn");
    const salirBtn = document.getElementById("salirBtn");

    // ---- Abrir cámara ----
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          console.log("🎥 Cámara iniciada correctamente");
        })
        .catch((err) => {
          console.error("Error al acceder a la cámara:", err);
          if (feedbackDiv) {
            feedbackDiv.textContent =
              "No se pudo acceder a la cámara. Revisa permisos del navegador.";
          }
        });
    }

    // ---- Timer ----
    let tiempoSeg = 0;
    let intervalo = null;
    const DURACION_OBJETIVO = 30; // segundos

    const formatear = (seg) => {
      const m = String(Math.floor(seg / 60)).padStart(2, "0");
      const s = String(seg % 60).padStart(2, "0");
      return `${m}:${s}`;
    };

    function actualizarTiempoUI() {
      if (tiempoSpan) tiempoSpan.textContent = formatear(tiempoSeg);
      if (hiitTimeSpan) hiitTimeSpan.textContent = formatear(tiempoSeg);
    }

    function iniciarTiempo() {
      if (intervalo) return;
      if (estadoSpan) estadoSpan.textContent = "En ejecución";
      if (hiitPhaseSpan) hiitPhaseSpan.textContent = "Ejecutando";
      intervalo = setInterval(() => {
        tiempoSeg++;
        actualizarTiempoUI();
        if (tiempoSeg >= DURACION_OBJETIVO) {
          pausarTiempo();
          if (feedbackDiv) {
            feedbackDiv.textContent =
              "Has llegado al tiempo objetivo. ¿Quieres seguir o salir?";
          }
          mostrarModal();
        }
      }, 1000);
    }

    function pausarTiempo() {
      if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
        if (estadoSpan) estadoSpan.textContent = "Pausado";
        if (hiitPhaseSpan) hiitPhaseSpan.textContent = "Pausa";
      }
    }

    function reiniciarTiempo() {
      pausarTiempo();
      tiempoSeg = 0;
      actualizarTiempoUI();
      if (estadoSpan) estadoSpan.textContent = "En espera";
      if (hiitPhaseSpan) hiitPhaseSpan.textContent = "Preparado";
      if (feedbackDiv) feedbackDiv.textContent = "Ejercicio listo para comenzar.";
      if (repsSpan) repsSpan.textContent = "0";

      if (window.rehabResetReps) {
        window.rehabResetReps(); // función de camara_rehab.js
      }
    }

    actualizarTiempoUI();

    // ---- Botones ----
    if (btnIniciar) {
      btnIniciar.addEventListener("click", () => {
        iniciarTiempo();
        if (feedbackDiv)
          feedbackDiv.textContent =
            "Ejercicio en curso. Mantén la técnica correcta.";
      });
    }

    if (btnPausar) {
      btnPausar.addEventListener("click", () => {
        pausarTiempo();
        if (feedbackDiv) feedbackDiv.textContent = "Ejercicio en pausa.";
      });
    }

    if (btnReiniciar) {
      btnReiniciar.addEventListener("click", () => {
        reiniciarTiempo();
      });
    }

    if (btnSalir) {
      btnSalir.addEventListener("click", () => {
        mostrarModal();
      });
    }

    // ---- Modal salir ----
    function mostrarModal() {
      if (exitModal) exitModal.classList.remove("hidden");
    }

    function ocultarModal() {
      if (exitModal) exitModal.classList.add("hidden");
    }

    if (seguirBtn) {
      seguirBtn.addEventListener("click", () => {
        ocultarModal();
        iniciarTiempo();
      });
    }

    if (salirBtn) {
      salirBtn.addEventListener("click", () => {
        window.location.href = "/pages/Catalogos/catalogo_rehabilitacion.html";
      });
    }
  }
})();
