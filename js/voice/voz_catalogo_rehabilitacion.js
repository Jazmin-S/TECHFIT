
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn("Voz catálogo rehab: API de voz no soportada");
    return;
  }

  const reco = new SR();
  reco.lang = "es-MX";
  reco.continuous = true;
  reco.interimResults = false;

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes
  }

  function scrollCantidad(delta) {
    window.scrollBy({
      top: delta,
      behavior: "smooth",
    });
  }

  // --- función que abre la página de demostración según nombre ---
  function abrirEjercicioPorNombre(nombre) {
    // nombre ya viene normalizado (sin tildes, en minúsculas)
    if (!nombre) return false;

    // HOMBRO
    if (
      nombre.includes("hombro") ||
      nombre.includes("movilidad de hombro")
    ) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=hombro_banda";
      return true;
    }

    // ELEVACIÓN DE PIERNA
    if (
      nombre.includes("pierna") ||
      nombre.includes("elevacion de pierna acostado") ||
      nombre.includes("elevacion pierna") ||
      nombre.includes("pierna acostado")
    ) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=elevacion_pierna_rehab";
      return true;
    }

    // CAMINATA LATERAL
    if (nombre.includes("caminata lateral con banda") || nombre.includes("lateral")) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=caminata_banda";
      return true;
    }

    // RODILLA
    if (nombre.includes("rodilla") || nombre.includes("extenciíon de rodilla")) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=rodilla_rehab";
      return true;
    }

    // LUMBAR
    if (nombre.includes("estiramiento lumbar") || nombre.includes("espalda baja")) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=lumbar";
      return true;
    }

    // TOBILLO
    if (nombre.includes("tobillo") || nombre.includes("movilidad de tobillo")) {
      window.location.href =
        "/pages/demostracion_rehabilitacion.html?ejercicio=tobillo_rehab";
      return true;
    }

    return false;
  }

  reco.onresult = (event) => {
    const result = event.results[event.results.length - 1][0].transcript;
    const frase = normalizar(result).trim();
    console.log("[voz catálogo rehab] ->", frase);

    // ---------- COMANDO GENÉRICO: "iniciar ejercicio [nombre]" ----------
    if (frase.startsWith("iniciar ejercicio")) {
      const nombre = frase.replace("iniciar ejercicio", "").trim();
      abrirEjercicioPorNombre(nombre);
      return;
    }

    // ---------- ATAJOS CORTOS (por si el usuario solo dice la palabra) ----------

    if (abrirEjercicioPorNombre(frase)) {
      return; // si ya abrió un ejercicio, cortamos
    }

    // ---------- MENÚ, PERFIL, SESIÓN ----------

    if (frase.includes("abrir menu") || frase.includes("mostrar menu")) {
      const menuBtn = document.getElementById("menuBtn");
      if (menuBtn) menuBtn.click();
    }

    if (
      frase.includes("cerrar menu") ||
      frase.includes("ocultar menu") ||
      frase.includes("quitar menu")
    ) {
      const closeSidebar = document.getElementById("closeSidebar");
      if (closeSidebar) closeSidebar.click();
    }

    if (frase === "perfil" || frase.includes("ir a perfil")) {
      window.location.href = "/pages/perfil.html";
    }

    if (
      frase.includes("cerrar sesion") ||
      frase.includes("cerrar sesión") ||
      frase.includes("cerrar cuenta")
    ) {
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) logoutBtn.click();
    }

    // ---------- SCROLL ----------

    if (frase.includes("bajar") || frase.includes("abajo")) {
      scrollCantidad(window.innerHeight * 0.6);
    }

    if (frase.includes("subir") || frase.includes("arriba")) {
      scrollCantidad(-window.innerHeight * 0.6);
    }
  };

  reco.onend = () => {
    // Lo mantenemos siempre escuchando en esta página
    reco.start();
  };

  window.addEventListener("load", () => {
    reco.start();
  });
})();
