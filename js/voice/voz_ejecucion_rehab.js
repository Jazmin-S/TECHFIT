// /js/voice/voz_ejecucion_rehab.js
// Voz para ejecución de rehabilitación:
// - Controla el ejercicio por voz (iniciar/pausar/reiniciar/salir)
// - Da retroalimentación hablada (reps, tiempo, estado)
// - Auto-feedback: dice "Repetición X" y "Te quedan N segundos"

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn("Voz ejecución rehab: API de voz no soportada");
    return;
  }

  // ====== CONFIGURACIÓN ======
  const DURACION_OBJETIVO = 30; // debe coincidir con ejecucion_rehab.js
  const AUTO_FEEDBACK = true;   // pon false si no quieres que hable solo

  const recognition = new SR();
  recognition.lang = "es-MX";
  recognition.continuous = true;
  recognition.interimResults = false;

  const btnIniciar = document.getElementById("btnIniciarEj");
  const btnPausar = document.getElementById("btnPausarEj");
  const btnReiniciar = document.getElementById("btnReiniciarEj");
  const btnSalir = document.getElementById("btnSalirEj");
  const exitModal = document.getElementById("exitModal");
  const seguirBtn = document.getElementById("seguirBtn");
  const salirBtn = document.getElementById("salirBtn");

  const repsSpan = document.getElementById("reps");
  const tiempoSpan = document.getElementById("tiempo");
  const estadoSpan = document.getElementById("estado");

  if (
    !btnIniciar ||
    !btnPausar ||
    !btnReiniciar ||
    !btnSalir ||
    !exitModal ||
    !repsSpan ||
    !tiempoSpan ||
    !estadoSpan
  ) {
    console.warn("Voz ejecución rehab: faltan elementos en la página");
    return;
  }

  // ====== UTILIDADES ======

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
    window.speechSynthesis.cancel(); // cancela lo anterior para no encimarse
    window.speechSynthesis.speak(u);
  }

  function parseTiempo(text) {
    // Formato esperado mm:ss
    const partes = text.split(":");
    if (partes.length !== 2) return 0;
    const m = parseInt(partes[0], 10) || 0;
    const s = parseInt(partes[1], 10) || 0;
    return m * 60 + s;
  }

  function formatoSegundos(seg) {
    if (seg < 0) seg = 0;
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    if (m === 0) return `${s} segundos`;
    if (s === 0) return `${m} minutos`;
    return `${m} minutos y ${s} segundos`;
  }

  // ====== COMANDOS DE VOZ ======

  recognition.addEventListener("result", (event) => {
    const res = event.results[event.results.length - 1][0].transcript;
    const frase = normalizar(res).trim();
    console.log("[voz ejecucion rehab] ->", frase);

    // ---- CONTROL BÁSICO ----

    // INICIAR
    if (frase.includes("iniciar ejercicio")) {
      btnIniciar.click();
      speak("Ejercicio iniciado, vamos con todo.");
      return;
    }

    // PAUSAR
    if (
      frase.includes("pausar ejercicio") ||
      frase.includes("pausa ejercicio")
    ) {
      btnPausar.click();
      speak("Ejercicio en pausa.");
      return;
    }

    // REANUDAR / CONTINUAR
    if (
      frase.includes("reanudar ejercicio") ||
      frase.includes("continuar ejercicio")
    ) {
      btnIniciar.click();
      speak("Reanudando ejercicio.");
      return;
    }

    // REINICIAR
    if (
      frase.includes("reiniciar ejercicio") ||
      frase.includes("empezar de nuevo")
    ) {
      btnReiniciar.click();
      speak("Reiniciando conteo y tiempo.");
      return;
    }

    // SALIR (abrir modal)
    if (frase === "salir" || frase.includes("salir de aqui")) {
      btnSalir.click();
      speak("¿Quieres seguir o salir?");
      return;
    }

    // CONFIRMAR SALIDA
    if (frase.includes("confirmar salida") || frase.includes("si salir")) {
      if (salirBtn) salirBtn.click();
      return;
    }

    // CANCELAR SALIDA
    if (frase.includes("seguir") || frase.includes("continuar aqui")) {
      if (seguirBtn) seguirBtn.click();
      speak("Perfecto, seguimos con el ejercicio.");
      return;
    }

    // ---- RETROALIMENTACIÓN POR COMANDO ----

    // REPETICIONES
    if (
      frase.includes("cuantas repeticiones") ||
      frase.includes("cuantas reps") ||
      frase.includes("repeticiones tengo") ||
      frase === "repeticiones" ||
      frase === "reps"
    ) {
      const reps = parseInt(repsSpan.textContent, 10) || 0;
      if (reps === 0) {
        speak("Aún no llevas repeticiones. Vamos, tú puedes.");
      } else {
        speak(`Llevas ${reps} repeticiones.`);
      }
      return;
    }

    // TIEMPO TRANSCURRIDO
    if (
      frase.includes("cuanto tiempo llevo") ||
      frase.includes("que tiempo llevo") ||
      frase === "tiempo" ||
      frase.includes("tiempo transcurrido")
    ) {
      const seg = parseTiempo(tiempoSpan.textContent);
      speak(`Llevas ${formatoSegundos(seg)} de ejercicio.`);
      return;
    }

    // TIEMPO RESTANTE
    if (
      frase.includes("cuanto tiempo falta") ||
      frase.includes("tiempo que queda") ||
      frase.includes("cuanto falta")
    ) {
      const seg = parseTiempo(tiempoSpan.textContent);
      const restante = DURACION_OBJETIVO - seg;
      if (restante <= 0) {
        speak("Ya completaste el tiempo objetivo.");
      } else {
        speak(`Te quedan ${formatoSegundos(restante)}.`);
      }
      return;
    }

    // ESTADO
    if (
      frase.includes("como voy") ||
      frase.includes("cual es mi estado") ||
      frase === "estado"
    ) {
      const estado = estadoSpan.textContent || "sin estado";
      const reps = parseInt(repsSpan.textContent, 10) || 0;
      const seg = parseTiempo(tiempoSpan.textContent);
      const restante = DURACION_OBJETIVO - seg;
      speak(
        `Tu estado es: ${estado}. Llevas ${reps} repeticiones y te quedan ${formatoSegundos(
          restante
        )}.`
      );
      return;
    }

    // MOTIVACIÓN
    if (
      frase.includes("motivame") ||
      frase.includes("motívame") ||
      frase.includes("animo") ||
      frase.includes("animo por favor")
    ) {
      speak(
        "Vas muy bien, controla la técnica y mantén el ritmo. Cada repetición cuenta."
      );
      return;
    }
  });

  recognition.addEventListener("end", () => {
    // Reiniciamos para que siempre esté escuchando
    recognition.start();
  });

  // ====== AUTO FEEDBACK (opcional) ======
  if (AUTO_FEEDBACK) {
    // Feedback automático al subir repeticiones
    let ultimaReps = parseInt(repsSpan.textContent, 10) || 0;
    const obsReps = new MutationObserver(() => {
      const actual = parseInt(repsSpan.textContent, 10) || 0;
      if (actual > ultimaReps) {
        speak(`Repetición ${actual} correcta.`);
      }
      ultimaReps = actual;
    });
    obsReps.observe(repsSpan, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // Feedback cuando se acerca el final del tiempo
    let avisoDiez = false;
    let avisoFinal = false;

    const obsTiempo = new MutationObserver(() => {
      const seg = parseTiempo(tiempoSpan.textContent);
      const restante = DURACION_OBJETIVO - seg;

      if (!avisoDiez && restante <= 10 && restante > 0) {
        avisoDiez = true;
        speak(`Te quedan ${restante} segundos. Mantén el esfuerzo.`);
      }

      if (!avisoFinal && restante <= 0) {
        avisoFinal = true;
        speak("Tiempo cumplido. Excelente trabajo.");
      }
    });
    obsTiempo.observe(tiempoSpan, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // ====== INICIO ======
  window.addEventListener("load", () => {
    recognition.start();
  });
})();
