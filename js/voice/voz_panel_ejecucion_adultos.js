// /js/voice/voz_panel_ejecucion_adultos.js
// Control del panel de comandos en EJECUCIÓN Adulto Mayor

(function () {
  document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    if (!btn || !panel) {
      console.warn("Panel de comandos (Ejecución Adultos) no encontrado.");
      return;
    }

    // Panel oculto al inicio
    panel.classList.remove("active");
    panel.style.display = "none";

    // Alternar al presionar el botón
    btn.addEventListener("click", () => {
      panel.classList.toggle("active");

      panel.style.display =
        panel.classList.contains("active") ? "block" : "none";
    });

    // Cerrar si se hace clic fuera
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove("active");
        panel.style.display = "none";
      }
    });
  });
})();
