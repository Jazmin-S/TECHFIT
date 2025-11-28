// /js/voice/voz_panel_catalogo_rehab.js
// Control visual del panel de comandos en catálogo de rehabilitación.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnVoicePanel");
    const panel = document.getElementById("voicePanel");

    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      // Si tu CSS usa .active para mostrar/ocultar, esto lo respeta
      panel.classList.toggle("active");

      // Si no tienes .active en CSS, esto garantiza que se vea:
      if (panel.classList.contains("active")) {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    });

    // Opcional: al cargar la página, que el panel esté oculto
    panel.classList.remove("active");
    panel.style.display = "none";
  });
})();
