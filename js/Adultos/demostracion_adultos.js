// =====================================================
//   DEMOSTRACIÓN ADULTOS MAYORES
//   Solo debe ejecutarse en demostracion_adultos.html
// =====================================================

(function () {

    const tituloDemo = document.getElementById("titulo-ejercicio");

    // Si NO existe el título → estamos en otra página (por ejemplo catálogo)
    if (!tituloDemo) {
        console.warn("demostracion_adultos.js detectado fuera de la página de demostración. No se ejecuta.");
        return;
    }

    // Evitar carga doble
    if (window.__demostracionAdultosLoaded__) {
        console.warn("demostracion_adultos.js ya estaba cargado. Evitando segunda carga.");
        return;
    }
    window.__demostracionAdultosLoaded__ = true;

    // =====================================================
    //   CONFIGURACIÓN: RUTA BASE DE LOS VIDEOS
    //   AJUSTA SOLO ESTA LÍNEA SI CAMBIAS LA CARPETA
    // =====================================================

    const BASE_VIDEOS = "/img/videos/";
    // Ejemplo de URL final: http://127.0.0.1:3001/img/videos/marchaenlugar.mp4

    console.log("🚀 BASE_VIDEOS (adultos) =", BASE_VIDEOS);

    // =====================================================
    //   BASE DE DATOS DE EJERCICIOS ADULTOS
    // =====================================================

    const infoAdultos = {
        marcha: {
            titulo: "Marcha en el lugar",
            video: BASE_VIDEOS + "marchaenlugar.mp4",
            instrucciones: [
                "Marcha suavemente en el lugar.",
                "Mantén el equilibrio.",
                "Respira de forma tranquila."
            ],
            tiempos: { p: "20 seg", i: "30 seg", a: "40 seg" },
            beneficios: [
                "Mejora la circulación.",
                "Activa las piernas.",
                "Ayuda a calentar el cuerpo."
            ]
        },

        talones_adulto: {
            titulo: "Elevación de talones",
            video: BASE_VIDEOS + "levantamientodetalones.mp4", // ajusta el nombre al archivo real
            instrucciones: [
                "Sujétate de una silla o pared si lo necesitas.",
                "Eleva los talones lentamente.",
                "Mantén 1 segundo arriba.",
                "Controla la bajada."
            ],
            tiempos: { p: "15 seg", i: "25 seg", a: "35 seg" },
            beneficios: [
                "Fortalece tobillos.",
                "Mejora el equilibrio.",
                "Ayuda a prevenir caídas."
            ]
        },

        // NUEVO: Sentarse y pararse
        sentarse: {
        titulo: "Sentarse y pararse",
        video: BASE_VIDEOS + "sentarseylevantarse.mp4", // ajusta al nombre real
        instrucciones: [
            "Siéntate en el borde de la silla con los pies apoyados en el piso.",
            "Inclina ligeramente el torso hacia adelante.",
            "Empuja con los pies y ponte de pie sin usar las manos si es posible.",
            "Regresa a sentarte de forma lenta y controlada.",
            "Evita dejarte caer al sentarte."
        ],
        tiempos: { p: "8 repeticiones", i: "10 repeticiones", a: "12 repeticiones" },
        beneficios: [
            "Fortalece piernas y glúteos.",
            "Mejora la funcionalidad para actividades diarias.",
            "Ayuda a mantener la independencia al levantarse de la silla."
        ]
    },

    // NUEVO: Elevación de brazos
    brazos_adulto: {
        titulo: "Elevación de brazos",
        video: BASE_VIDEOS + "elevacionesdebrazo.mp4", // ajusta al nombre real
        instrucciones: [
            "Siéntate o ponte de pie con la espalda recta.",
            "Eleva los brazos al frente hasta la altura de los hombros.",
            "Mantén un momento la posición.",
            "Baja los brazos lentamente.",
            "Mantén los hombros relajados, sin encogerlos hacia las orejas."
        ],
        tiempos: { p: "15 seg", i: "25 seg", a: "35 seg" },
        beneficios: [
            "Fortalece hombros y brazos.",
            "Mejora la movilidad de la parte superior del cuerpo.",
            "Favorece la circulación en brazos y hombros."
        ]
    },

    // NUEVO: Círculos de hombro
    hombros_adulto: {
        titulo: "Círculos de hombro",
        video: BASE_VIDEOS + "circulodehombros.mp4", // ajusta al nombre real
        instrucciones: [
            "Siéntate o ponte de pie con la espalda recta.",
            "Coloca los hombros ligeramente hacia adelante.",
            "Realiza círculos suaves hacia atrás con ambos hombros.",
            "Luego realiza círculos suaves hacia adelante.",
            "Haz los movimientos lentos y sin dolor."
        ],
        tiempos: { p: "20 seg", i: "30 seg", a: "40 seg" },
        beneficios: [
            "Mejora la movilidad de los hombros.",
            "Disminuye la rigidez en cuello y parte alta de la espalda.",
            "Ayuda a mantener una mejor postura."
        ]
    },

    // NUEVO: Extensión de pierna sentad@
    pierna_adulto: {
        titulo: "Extensión de pierna sentado",
        video: BASE_VIDEOS + "extensionpierna.mp4", // ajusta al nombre real
        instrucciones: [
            "Siéntate en una silla con la espalda recta.",
            "Estira una pierna hacia adelante hasta extender la rodilla.",
            "Mantén la posición 1–2 segundos.",
            "Baja la pierna lentamente.",
            "Repite con la otra pierna, alternándolas."
        ],
        tiempos: {
            p: "10 repeticiones por pierna",
            i: "12 repeticiones por pierna",
            a: "15 repeticiones por pierna"
        },
        beneficios: [
            "Fortalece el músculo del muslo (cuádriceps).",
            "Mejora la estabilidad de la rodilla.",
            "Facilita actividades como subir escaleras o levantarse de la silla."
        ]
    }
    };

    // Dejar accesible por si lo ocupas en otros scripts (voz, etc.)
    window.infoAdultos = infoAdultos;

    // =====================================================
    //   CARGA DEL EJERCICIO SELECCIONADO
    // =====================================================

    const q = new URLSearchParams(window.location.search);
    const ej = q.get("ejercicio");
    const d = infoAdultos[ej];

    if (!d) {
        console.warn("Ejercicio no encontrado en infoAdultos:", ej);
        return;
    }

    // Título
    tituloDemo.textContent = d.titulo;

    // Video
    const video = document.getElementById("video-ejercicio");
    video.src = d.video;
    console.log("🎬 Cargando video adultos desde:", video.src);

    // Instrucciones
    const listaInstr = document.getElementById("lista-instrucciones");
    d.instrucciones.forEach(txt => {
        const li = document.createElement("li");
        li.textContent = txt;
        listaInstr.appendChild(li);
    });

    // Tiempos
    document.getElementById("tiempo-principiante").textContent = d.tiempos.p;
    document.getElementById("tiempo-intermedio").textContent = d.tiempos.i;
    document.getElementById("tiempo-avanzado").textContent = d.tiempos.a;

    // Beneficios
    const listaBen = document.getElementById("beneficios");
    d.beneficios.forEach(txt => {
        const li = document.createElement("li");
        li.textContent = txt;
        listaBen.appendChild(li);
    });

    // Botón iniciar
    document.getElementById("btnIniciar").onclick = () => {
        window.location.href = `/pages/ejecucion_adultos.html?ejercicio=${ej}`;
    };

})(); // fin IIFE
