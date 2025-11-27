// js/Rehabilitacion/camara_rehab.js
// Cámara + IA usando MediaPipe Pose con detección por ejercicio.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const DEBUG = false; // pon true para ver logs detallados en consola

    const video = document.getElementById("video");
    const canvas = document.getElementById("poseCanvas");

    if (!video || !canvas) {
      console.warn("camara_rehab.js: falta #video o #poseCanvas");
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
      Tipos de detección:
      - vertical:    usamos y (0 arriba, 1 abajo). Sube y baja.
      - verticalInv: para lumbar (el torso baja y vuelve).
      - horizontal:  para caminata lateral (se desplaza en x).
    */

    const ejerciciosConfig = {
      hombro_banda: {
        nombre: "Movilidad de hombro con banda",
        tipo: "vertical",
        landmarks: 15, // muñeca izquierda
        deltaArriba: 0.18,
        deltaAbajo: 0.08,
      },
      elevacion_pierna_rehab: {
        nombre: "Elevación de pierna acostado",
        tipo: "vertical",
        landmarks: [27, 28], // ambos tobillos
        deltaArriba: 0.18,
        deltaAbajo: 0.08,
      },
      caminata_banda: {
        nombre: "Caminata lateral con banda",
        tipo: "horizontal",
        // usamos el centro de cadera (23 y 24)
        metricFn: (lm) => {
          const hipL = lm[23];
          const hipR = lm[24];
          if (!hipL || !hipR) return null;
          return (hipL.x + hipR.x) / 2;
        },
        deltaLado: 0.10,  // cuánto se debe ir hacia un lado
        deltaCentro: 0.04 // cuánto debe regresar hacia el centro
      },
      rodilla_rehab: {
        nombre: "Extensión de rodilla",
        tipo: "vertical",
        landmarks: [27, 28], // ambos tobillos
        deltaArriba: 0.15,
        deltaAbajo: 0.07,
      },
      lumbar: {
        nombre: "Estiramiento lumbar",
        tipo: "verticalInv",
        landmarks: 0, // nariz
        deltaArriba: 0.16,
        deltaAbajo: 0.07,
      },
      tobillo_rehab: {
        nombre: "Movilidad de tobillo",
        tipo: "vertical",
        landmarks: [27, 28], // ambos tobillos
        deltaArriba: 0.10,
        deltaAbajo: 0.05,
      },
    };

    let reps = 0;
    let fase = "abajo"; // abajo -> arriba -> abajo = 1 rep

    const cfgBase = ejerciciosConfig[ejercicio] || null;
    if (!cfgBase) {
      console.warn("camara_rehab.js: ejercicio sin config:", ejercicio);
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

    // Exponer función para reset desde ejecucion_rehab.js
    window.rehabResetReps = function () {
      reps = 0;
      fase = "abajo";
      if (cfg) {
        cfg.baseMetric = null;
        cfg.arriba = null;
        cfg.abajo = null;
        cfg.calibrado = false;
      }
      setReps(0);
      if (DEBUG) console.log("[Rehab] Reset reps + calibración");
    };

    // ---- Verificar MediaPipe Pose ----
    let PoseCtor = null;
    if (typeof Pose !== "undefined") {
      PoseCtor = Pose.Pose || Pose;
    }

    if (!PoseCtor) {
      console.warn("MediaPipe Pose no disponible. Modo solo cámara.");
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

      if (cfg.tipo === "horizontal") {
        const xCentro = cfg.metricFn ? cfg.metricFn(lm) : null;
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
          `[Rehab] Calibrado ${ejercicio}: base=${cfg.baseMetric.toFixed(
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
            `[Rehab] ${ejercicio} metric=${metric.toFixed(
              3
            )} | arr=${cfg.arriba.toFixed(3)} ab=${cfg.abajo.toFixed(
              3
            )} fase=${fase}`
          );
        }

        if (fase === "abajo" && esArriba(metric)) {
          fase = "arriba";
          if (DEBUG) console.log("[Rehab] fase -> ARRIBA");
        } else if (fase === "arriba" && esAbajo(metric)) {
          fase = "abajo";
          reps++;
          setReps(reps);
          if (DEBUG) console.log(`[Rehab] REP ${reps}`);
        }
      }

      ctx.restore();
    }

    async function loop() {
      if (video.readyState >= 2) {
        try {
          await pose.send({ image: video });
        } catch (err) {
          console.error("Error al enviar frame a Pose:", err);
        }
      }
      requestAnimationFrame(loop);
    }

    video.addEventListener("loadeddata", () => {
      console.log("camara_rehab.js: cámara lista, iniciando IA Pose");
      setEstado("Ejercicio listo para comenzar.");
      setLeds(false);
      setReps(0);
      ajustarCanvas();
      loop();
    });
  });
})();
