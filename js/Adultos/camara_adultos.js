// js/Adultos/camara_adultos.js
// Cámara + IA usando MediaPipe Pose para ejercicios de Adultos Mayores.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const DEBUG = false; // pon true para ver logs detallados en consola

    const video = document.getElementById("video");
    const canvas = document.getElementById("poseCanvas");

    if (!video || !canvas) {
      console.warn("camara_adultos.js: falta #video o #poseCanvas");
      return;
    }

    const ctx = canvas.getContext("2d");
    const repsSpan = document.getElementById("reps");
    const estadoSpan = document.getElementById("estado");
    const ledVerde = document.getElementById("light-ok");
    const ledRojo = document.getElementById("light-bad");

    const setEstado = (txt) => {
      if (estadoSpan) estadoSpan.textContent = txt;
    };

    const setLeds = (ok) => {
      if (!ledVerde || !ledRojo) return;
      ledVerde.classList.toggle("activo", ok);
      ledRojo.classList.toggle("activo", !ok);
    };

    const setReps = (v) => {
      if (repsSpan) repsSpan.textContent = String(v);
    };

    // ---- Ejercicio actual ----
    const params = new URLSearchParams(window.location.search);
    const ejercicio = params.get("ejercicio") || "";

    /*
      Tipos de detección (igual que rehab):
      - vertical:    usamos y (0 arriba, 1 abajo). Sube y baja.
      - verticalInv: el cuerpo/brazo baja más y luego sube (inverso).
      - horizontal:  se desplaza en x (izq-der).
    */

    const ejerciciosConfig = {
      // Marcha en el lugar: miramos tobillos y contamos cuando suben y bajan.
      marcha: {
        nombre: "Marcha en el lugar",
        tipo: "vertical",
        landmarks: [27, 28], // tobillos
        deltaArriba: 0.12,
        deltaAbajo: 0.05,
      },

      // Elevación de talones: también tobillos, con un umbral un poco menor.
      talones_adulto: {
        nombre: "Elevación de talones",
        tipo: "vertical",
        landmarks: [27, 28],
        deltaArriba: 0.10,
        deltaAbajo: 0.04,
      },

      // Sentarse y pararse: usamos la cadera (hip) y verticalInv (baja y sube).
      sentarse: {
        nombre: "Sentarse y pararse",
        tipo: "verticalInv",
        landmarks: 24, // cadera derecha
        deltaArriba: 0.12,
        deltaAbajo: 0.06,
      },

      // Elevación de brazos: muñecas.
      brazos_adulto: {
        nombre: "Elevación de brazos",
        tipo: "vertical",
        landmarks: [15, 16], // muñecas
        deltaArriba: 0.15,
        deltaAbajo: 0.07,
      },

      // Círculos de hombro: tomamos los hombros y contamos el “ciclo” arriba / abajo.
      hombros_adulto: {
        nombre: "Círculos de hombro",
        tipo: "vertical",
        landmarks: [11, 12], // hombros
        deltaArriba: 0.05,
        deltaAbajo: 0.02,
      },

      // Extensión de pierna sentado: igual que extensión de rodilla en rehab.
      pierna_adulto: {
        nombre: "Extensión de pierna sentado",
        tipo: "vertical",
        landmarks: [27, 28], // tobillos
        deltaArriba: 0.15,
        deltaAbajo: 0.07,
      },
    };

    let reps = 0;
    let fase = "abajo"; // abajo -> arriba -> abajo = 1 rep

    const cfgBase = ejerciciosConfig[ejercicio] || null;
    if (!cfgBase) {
      console.warn("camara_adultos.js: ejercicio sin config:", ejercicio);
    }

    const cfg = cfgBase
      ? {
          ...cfgBase,
          baseMetric: null,
          arriba: null,
          abajo: null,
          calibrado: false,
        }
      : null;

    // Exponer función para reset desde ejecucion_adultos.js
    window.adultosResetReps = function () {
      reps = 0;
      fase = "abajo";
      if (cfg) {
        cfg.baseMetric = null;
        cfg.arriba = null;
        cfg.abajo = null;
        cfg.calibrado = false;
      }
      setReps(0);
      if (DEBUG) console.log("[Adultos] Reset reps + calibración");
    };

    // ---- Verificar MediaPipe Pose ----
    let PoseCtor = null;
    if (typeof Pose !== "undefined") {
      // En algunos builds es Pose.Pose, en otros Pose directo
      PoseCtor = Pose.Pose || Pose;
    }

    if (!PoseCtor) {
      console.warn("MediaPipe Pose no disponible. Modo solo cámara (Adultos).");
      setEstado("Ejercicio listo (sin IA)");
      setLeds(false);
      return;
    }

    const pose = new PoseCtor({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    function ajustarCanvas() {
      if (!video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.style.width = video.clientWidth + "px";
      canvas.style.height = video.clientHeight + "px";
    }

    // Obtener métrica según tipo de ejercicio
    function obtenerMetrica(lm) {
      if (!cfg) return null;

      if (cfg.tipo === "horizontal" && cfg.metricFn) {
        const xCentro = cfg.metricFn(lm);
        if (xCentro == null) return null;
        if (!cfg.calibrado) {
          cfg.baseMetric = xCentro;
        }
        return Math.abs(xCentro - cfg.baseMetric);
      }

      const idx = cfg.landmarks;
      let y = null;

      if (Array.isArray(idx)) {
        const ys = idx
          .map((i) => lm[i])
          .filter(Boolean)
          .map((p) => p.y);
        if (!ys.length) return null;

        if (cfg.tipo === "vertical") {
          y = Math.min(...ys); // sube más = y más chico
        } else {
          y = Math.max(...ys); // verticalInv: baja más = y más grande
        }
      } else {
        const p = lm[idx];
        if (!p) return null;
        y = p.y;
      }

      return y;
    }

    function calibrar(metric) {
      if (!cfg || cfg.calibrado) return;

      cfg.baseMetric = metric;

      if (cfg.tipo === "horizontal") {
        cfg.arriba = cfg.deltaLado;
        cfg.abajo = cfg.deltaCentro;
      } else if (cfg.tipo === "vertical") {
        cfg.arriba = cfg.baseMetric - cfg.deltaArriba;
        cfg.abajo = cfg.baseMetric - cfg.deltaAbajo;
      } else if (cfg.tipo === "verticalInv") {
        cfg.arriba = cfg.baseMetric + cfg.deltaArriba;
        cfg.abajo = cfg.baseMetric + cfg.deltaAbajo;
      }

      cfg.calibrado = true;

      if (DEBUG) {
        console.log(
          `[Adultos] Calibrado ${ejercicio}: base=${cfg.baseMetric.toFixed(
            3
          )}, arriba=${cfg.arriba.toFixed(3)}, abajo=${cfg.abajo.toFixed(3)}`
        );
      }
    }

    function esArriba(metric) {
      if (!cfg) return false;

      if (cfg.tipo === "horizontal") {
        return metric > cfg.arriba;
      } else if (cfg.tipo === "vertical") {
        return metric < cfg.arriba;
      } else if (cfg.tipo === "verticalInv") {
        return metric > cfg.arriba;
      }
      return false;
    }

    function esAbajo(metric) {
      if (!cfg) return false;

      if (cfg.tipo === "horizontal") {
        return metric < cfg.abajo;
      } else if (cfg.tipo === "vertical") {
        return metric > cfg.abajo;
      } else if (cfg.tipo === "verticalInv") {
        return metric < cfg.abajo;
      }
      return false;
    }

    function onResults(results) {
      ajustarCanvas();

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      const lm = results.poseLandmarks;

      if (!lm || lm.length === 0) {
        setEstado("En espera (no se detecta cuerpo)");
        setLeds(false);
        ctx.restore();
        return;
      }

      setEstado("Persona detectada");
      setLeds(true);

      // Dibujar puntos de la pose
      ctx.fillStyle = "#00ffff";
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Conteo de reps según ejercicio ----
      if (cfg) {
        const metric = obtenerMetrica(lm);
        if (metric == null) {
          ctx.restore();
          return;
        }

        if (!cfg.calibrado) {
          calibrar(metric);
        }

        if (DEBUG) {
          console.log(
            `[Adultos] ${ejercicio} metric=${metric.toFixed(
              3
            )} | arr=${cfg.arriba.toFixed(3)} ab=${cfg.abajo.toFixed(
              3
            )} fase=${fase}`
          );
        }

        if (fase === "abajo" && esArriba(metric)) {
          fase = "arriba";
          if (DEBUG) console.log("[Adultos] fase -> ARRIBA");
        } else if (fase === "arriba" && esAbajo(metric)) {
          fase = "abajo";
          reps++;
          setReps(reps);
          if (DEBUG) console.log(`[Adultos] REP ${reps}`);
        }
      }

      ctx.restore();
    }

    async function loop() {
      if (video.readyState >= 2) {
        try {
          await pose.send({ image: video });
        } catch (err) {
          console.error("Error al enviar frame a Pose (Adultos):", err);
        }
      }
      requestAnimationFrame(loop);
    }

    video.addEventListener("loadeddata", () => {
      console.log("camara_adultos.js: cámara lista, iniciando IA Pose");
      setEstado("Ejercicio listo para comenzar.");
      setLeds(false);
      setReps(0);
      ajustarCanvas();
      loop();
    });
  });
})();
