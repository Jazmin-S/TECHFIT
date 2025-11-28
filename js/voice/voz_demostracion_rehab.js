// /js/voice/voz_demostracion_rehab.js

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn("Voz demostración rehab: API de voz no soportada");
    return;
  }

  const recognition = new SR();
  recognition.lang = "es-MX";
  recognition.continuous = true;
  recognition.interimResults = false;

  const video = document.getElementById("video-ejercicio");
  const btnIniciar = document.getElementById("btnIniciar");
  const tituloDemo = document.getElementById("titulo-ejercicio");

  // Si no estamos realmente en la página de demostración de rehab, no hacemos nada
  if (!video || !btnIniciar || !tituloDemo) {
    console.warn("Voz demostración rehab: elementos no encontrados");
    return;
  }

  // --- UTILIDADES ---

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function speak(texto) {
    if (!("speechSynthesis" in window)) {
      console.warn("Este navegador no soporta SpeechSynthesis");
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-MX";
    // Cancelamos por si estaba hablando algo anterior
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function explicarEjercicio() {
    const titulo = tituloDemo.textContent || "";
    const pasosLi = document.querySelectorAll("#lista-instrucciones li");

    const pasos = Array.from(pasosLi).map((li, idx) => {
      return `${idx + 1}. ${li.textContent}`;
    });

    let texto = "";

    if (titulo) {
      texto += `${titulo}. `;
    }

    if (pasos.length > 0) {
      texto += "Instrucciones: ";
      texto += pasos.join(". ") + ".";
    } else {
      texto += "No encontré instrucciones en pantalla.";
    }

    speak(texto);
  }

  // --- RECONOCIMIENTO DE VOZ ---

  recognition.addEventListener("result", (event) => {
    const res = event.results[event.results.length - 1][0].transcript;
    const frase = normalizar(res).trim();
    console.log("[voz demostracion rehab] ->", frase);

    // INICIAR EJERCICIO
    if (frase.includes("iniciar ejercicio")) {
      btnIniciar.click();
    }

    // PAUSAR VIDEO / EJERCICIO
    if (
      frase.includes("pausar video") ||
      frase.includes("pausa video") ||
      frase.includes("pausar ejercicio")
    ) {
      if (video && !video.paused) video.pause();
    }

    // REPRODUCIR / REANUDAR
    if (
      frase.includes("reproducir video") ||
      frase.includes("reanudar video") ||
      frase.includes("continuar video") ||
      frase.includes("reanudar ejercicio") ||
      frase.includes("continuar ejercicio")
    ) {
      if (video && video.paused) video.play();
    }

    // EXPLICAR / LEER INSTRUCCIONES
    if (
      frase.includes("explicar ejercicio") ||
      frase.includes("explica ejercicio") ||
      frase.includes("leer instrucciones") ||
      frase.includes("lee las instrucciones") ||
      frase.includes("repetir instrucciones")
    ) {
      explicarEjercicio();
    }

    // SALIR
    if (frase === "salir" || frase.includes("salir de aqui")) {
      window.location.href = "/pages/Catalogos/catalogo_rehabilitacion.html";
    }
  });

  recognition.addEventListener("end", () => {
    recognition.start();
  });

  window.addEventListener("load", () => {
    recognition.start();
  });
})();
