// =====================================================
//   DEMOSTRACIÓN REHABILITACIÓN
//   Solo debe ejecutarse en demostracion_rehabilitacion.html
// =====================================================

(function () {

    const tituloDemo = document.getElementById("titulo-ejercicio");

    // Si NO existe el título → estamos en otra página (por ejemplo catálogo)
    if (!tituloDemo) {
        console.warn("demostracion_rehab.js detectado fuera de la página de demostración. No se ejecuta.");
        return;
    }

    // Evitar carga doble
    if (window.__demostracionRehabLoaded__) {
        console.warn("demostracion_rehab.js ya estaba cargado. Evitando segunda carga.");
        return;
    }
    window.__demostracionRehabLoaded__ = true;

    // =====================================================
    //   CONFIGURACIÓN: RUTA BASE DE LOS VIDEOS
    //   AJUSTA SOLO ESTA LÍNEA SI CAMBIAS LA CARPETA
    // =====================================================

    const BASE_VIDEOS = "/img/videos/"; 
    // Ejemplo de URL final: http://127.0.0.1:3001/img/videos/hombro_banda.mp4

    // Solo para que veas en consola qué URL se está construyendo
    console.log("🚀 BASE_VIDEOS =", BASE_VIDEOS);

    // =====================================================
    //   BASE DE DATOS DE EJERCICIOS DE REHAB
    // =====================================================

    const infoRehab = {

        // 1. Movilidad de hombro con banda
        
        // 2. Elevación de pierna acostado
        elevacion_pierna_rehab: {
            titulo: "Elevación de pierna acostado",
            video: BASE_VIDEOS + "elevacion_pierna.mp4",
            instrucciones: [
                "Acuéstate boca arriba con una pierna flexionada.",
                "Estira la otra pierna completamente.",
                "Eleva la pierna recta sin doblar la rodilla.",
                "Controla la bajada.",
                "Evita arquear la zona lumbar."
            ],
            tiempos: { p: "15 seg", i: "25 seg", a: "40 seg" },
            beneficios: [
                "Fortalece cuádriceps y psoas.",
                "Mejora la estabilidad de la cadera."
            ]
        },

        // 3. Caminata lateral con banda
        caminata_banda: {
            titulo: "Caminata lateral con banda",
            video: BASE_VIDEOS + "caminata_banda.mp4",
            instrucciones: [
                "Coloca la banda en tobillos o rodillas.",
                "Flexiona ligeramente las rodillas.",
                "Da pasos laterales sin juntar completamente los pies.",
                "Mantén el abdomen activo.",
                "Evita que las rodillas colapsen hacia adentro."
            ],
            tiempos: { p: "15 seg", i: "25 seg", a: "35 seg" },
            beneficios: [
                "Activa el glúteo medio.",
                "Mejora la estabilidad de la cadera.",
                "Ayuda a prevenir lesiones."
            ]
        },

        // 4. Extensión de rodilla
        rodilla_rehab: {
            titulo: "Extensión de rodilla",
            video: BASE_VIDEOS + "rodilla.mp4",
            instrucciones: [
                "Siéntate con la espalda recta.",
                "Estira la pierna lentamente hasta extender completamente.",
                "Mantén 1 segundo arriba.",
                "Baja controlando el movimiento."
            ],
            tiempos: { p: "10 seg", i: "20 seg", a: "30 seg" },
            beneficios: [
                "Fortalece el cuádriceps.",
                "Mejora la estabilidad de la rodilla."
            ]
        },

        // 5. Estiramiento lumbar
        lumbar: {
            titulo: "Estiramiento lumbar",
            video: BASE_VIDEOS + "lumbar.mp4",
            instrucciones: [
                "Acuéstate boca arriba.",
                "Lleva las rodillas al pecho con ambas manos.",
                "Relaja la zona lumbar.",
                "Respira profundamente."
            ],
            tiempos: { p: "20 seg", i: "30 seg", a: "45 seg" },
            beneficios: [
                "Reduce la tensión lumbar.",
                "Mejora la flexibilidad de la espalda."
            ]
        },

        // 6. Movilidad de tobillo
        tobillo_rehab: {
            titulo: "Movilidad de tobillo",
            video: BASE_VIDEOS + "tobillo.mp4",
            instrucciones: [
                "Siéntate con la pierna estirada al frente.",
                "Lleva el pie hacia arriba (flexión dorsal).",
                "Llévalo hacia abajo (flexión plantar).",
                "Haz círculos lentos con el tobillo."
            ],
            tiempos: { p: "15 seg", i: "25 seg", a: "40 seg" },
            beneficios: [
                "Recupera movilidad del tobillo.",
                "Reduce rigidez tras esguinces."
            ]
        }
    };

    // Dejar accesible para el archivo de voz (si lo usas)
    window.infoRehab = infoRehab;

    // =====================================================
    //   CARGA DEL EJERCICIO SELECCIONADO
    // =====================================================

    const q = new URLSearchParams(window.location.search);
    const ej = q.get("ejercicio");
    const d2 = infoRehab[ej];

    if (!d2) {
        console.warn("Ejercicio no encontrado en infoRehab:", ej);
        return;
    }

    // Título
    tituloDemo.textContent = d2.titulo;

    // Video
    const video = document.getElementById("video-ejercicio");
    video.src = d2.video;
    console.log("🎬 Cargando video desde:", video.src);

    // Instrucciones
    const listaInstr = document.getElementById("lista-instrucciones");
    d2.instrucciones.forEach(txt => {
        const li = document.createElement("li");
        li.textContent = txt;
        listaInstr.appendChild(li);
    });

    // Tiempos
    document.getElementById("tiempo-principiante").textContent = d2.tiempos.p;
    document.getElementById("tiempo-intermedio").textContent = d2.tiempos.i;
    document.getElementById("tiempo-avanzado").textContent = d2.tiempos.a;

    // Beneficios
    const listaBen = document.getElementById("beneficios");
    d2.beneficios.forEach(txt => {
        const li = document.createElement("li");
        li.textContent = txt;
        listaBen.appendChild(li);
    });

    // Botón iniciar
    document.getElementById("btnIniciar").onclick = () => {
        window.location.href = `/pages/ejecucion_rehabilitacion.html?ejercicio=${ej}`;
    };

})(); // fin IIFE
