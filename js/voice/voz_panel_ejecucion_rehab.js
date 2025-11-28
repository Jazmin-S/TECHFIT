// /js/voice/voz_panel_ejecucion_rehab.js
// Control visual del panel de comandos en ejecución de rehabilitación.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    if (!btn || !panel) return;

    // estado inicial: oculto
    panel.classList.remove("active");
    panel.style.display = "none";

    btn.addEventListener("click", () => {
      panel.classList.toggle("active");
      panel.style.display = panel.classList.contains("active")
        ? "block"
        : "none";
    });
  });
})();
