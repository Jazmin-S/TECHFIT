// js/Adultos/ejecucion_adultos.js
// Maneja título, timer, botones, modal y abre la cámara (versión Adultos Mayores)

(function () {
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    // ---- Leer ejercicio de la URL ----
    const params = new URLSearchParams(window.location.search);
    const ej = params.get("ejercicio") || "";

    // Nombres para ADULTOS MAYORES (deben coincidir con tus IDs del catálogo)
    const nombres = {
      marcha: "Marcha en el lugar",
      talones_adulto: "Elevación de talones",
      sentarse: "Sentarse y pararse",
      brazos_adulto: "Elevación de brazos",
      hombros_adulto: "Círculos de hombro",
      pierna_adulto: "Extensión de pierna sentado",
    };

    const titulo = document.getElementById("titulo-ejercicio");
    const inputEj = document.getElementById("ejercicio-actual");
    if (titulo) titulo.textContent = nombres[ej] || "Ejercicio para adulto mayor";
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
          console.log("🎥 Cámara Adultos iniciada correctamente");
        })
        .catch((err) => {
          console.error("Error al acceder a la cámara (Adultos):", err);
          if (feedbackDiv) {
            feedbackDiv.textContent =
              "No se pudo acceder a la cámara. Revisa permisos del navegador.";
          }
        });
    }

    // ---- Timer ----
    let tiempoSeg = 0;
    let intervalo = null;
    const DURACION_OBJETIVO = 30; // segundos (puedes bajar a 20 si quieres más suave)

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

      // Llamamos a la función de reset definida en camara_adultos.js
      if (window.adultosResetReps) {
        window.adultosResetReps();
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
        // Importante: regresar al catálogo de ADULTOS
        window.location.href = "/pages/Catalogos/catalogo_adultos.html";
      });
    }
  }
})();
