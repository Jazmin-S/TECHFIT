// /js/voice/voz_panel_catalogo_adultos.js
// Control visual del panel de comandos en catálogo de Adulto Mayor

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    if (!btn || !panel) {
      console.warn("Panel de comandos (Catálogo Adultos) no encontrado.");
      return;
    }

    // Ocultar al inicio
    panel.classList.remove("active");
    panel.style.display = "none";

    // Abrir/cerrar
    btn.addEventListener("click", () => {
      panel.classList.toggle("active");

      if (panel.classList.contains("active")) {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    });

    // Cerrar si hace clic fuera
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove("active");
        panel.style.display = "none";
      }
    });
  });
})();
