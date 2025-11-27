// =====================================
// OBTENER EJERCICIO DESDE LA URL
// =====================================
const params = new URLSearchParams(window.location.search);
const ejercicio = params.get("ejercicio");

// =====================================
// BASE DE DATOS DE EJERCICIOS – VERSION PRO
// =====================================
const ejerciciosInfo = {
    sentadillas: {
        titulo: "Sentadillas",
        video: "/img/videos/sentadillas.mp4",
        tiempo: {
            principiante: "2 series de 10 repeticiones",
            intermedio: "3 series de 12 repeticiones",
            avanzado: "4 series de 15 repeticiones"
        },
        beneficios: [
            "Fortalece piernas y glúteos",
            "Mejora equilibrio y postura",
            "Incrementa movilidad de cadera"
        ],
        instrucciones: [
            "Coloca los pies al ancho de los hombros.",
            "Mantén la espalda recta durante todo el movimiento.",
            "Baja la cadera como si fueras a sentarte.",
            "Las rodillas no deben sobrepasar la punta de los pies.",
            "Sube apretando glúteos y mantén el abdomen firme."
        ]
    },

    desplantes: {
        titulo: "Desplantes",
        video: "/img/videos/desplantes.mp4",
        tiempo: {
            principiante: "2 series de 8 por pierna",
            intermedio: "3 series de 10 por pierna",
            avanzado: "4 series de 12 por pierna"
        },
        beneficios: [
            "Fortalece piernas y glúteos",
            "Mejora estabilidad en rodillas",
            "Ayuda a tonificar piernas"
        ],
        instrucciones: [
            "Da un paso largo hacia adelante.",
            "Flexiona ambas rodillas en ángulos de 90°.",
            "Mantén la espalda recta.",
            "Impúlsate hacia atrás para volver a la posición inicial."
        ]
    },

    elevaciones_brazo: {
        titulo: "Elevaciones de brazo",
        video: "/img/videos/elevacion_brazo.mp4",
        tiempo: {
            principiante: "2 series de 12 repeticiones",
            intermedio: "3 series de 15 repeticiones",
            avanzado: "4 series de 20 repeticiones"
        },
        beneficios: [
            "Fortalece hombros",
            "Mejora movilidad de articulación del hombro",
            "Ayuda a corregir postura"
        ],
        instrucciones: [
            "Levanta el brazo hasta la altura del hombro.",
            "Evita encoger el hombro hacia la oreja.",
            "Controla el movimiento al subir y bajar.",
            "Mantén abdomen firme."
        ]
    },

    flexiones_pared: {
        titulo: "Flexiones de pared",
        video: "/img/videos/flexion_pared.mp4",
        tiempo: {
            principiante: "2 series de 10 repeticiones",
            intermedio: "3 series de 12 repeticiones",
            avanzado: "4 series de 15 repeticiones"
        },
        beneficios: [
            "Fortalece pecho y brazos",
            "Ideal para principiantes y rehabilitación",
            "Reduce carga sobre articulaciones"
        ],
        instrucciones: [
            "Apoya las manos en la pared al nivel del pecho.",
            "Baja el pecho hacia la pared flexionando los codos.",
            "Mantén el cuerpo recto.",
            "Empuja de regreso extendiendo los brazos."
        ]
    },

    plancha: {
        titulo: "Plancha",
        video: "/img/videos/plancha.mp4",
        tiempo: {
            principiante: "3 series de 15–20 segundos",
            intermedio: "3 series de 30–40 segundos",
            avanzado: "3 series de 60 segundos"
        },
        beneficios: [
            "Fortalece abdomen y zona lumbar",
            "Mejora estabilidad del core",
            "Ayuda a prevenir dolores de espalda"
        ],
        instrucciones: [
            "Apoya antebrazos y puntas de los pies.",
            "Mantén el cuerpo completamente recto.",
            "Activa abdomen y glúteos.",
            "Evita levantar demasiado la cadera."
        ]
    },

    rodillas: {
        titulo: "Elevación de rodillas",
        video: "/img/videos/rodillas.mp4",
        tiempo: {
            principiante: "2 series de 20 repeticiones",
            intermedio: "3 series de 30 repeticiones",
            avanzado: "3 series de 40 repeticiones"
        },
        beneficios: [
            "Mejora coordinación",
            "Aumenta resistencia",
            "Activa muslos y abdomen"
        ],
        instrucciones: [
            "Eleva una rodilla al pecho.",
            "Alterna de manera fluida.",
            "Mantén el torso firme.",
            "Mantén ritmo constante."
        ]
    },

    jumping: {
        titulo: "Jumping jacks",
        video: "/img/videos/jumping.mp4",
        tiempo: {
            principiante: "2 series de 20 segundos",
            intermedio: "3 series de 30 segundos",
            avanzado: "3 series de 45–60 segundos"
        },
        beneficios: [
            "Excelente ejercicio cardiovascular",
            "Mejora coordinación",
            "Activa brazos, piernas y abdomen"
        ],
        instrucciones: [
            "Salta abriendo piernas y brazos.",
            "Cierra piernas y baja brazos en el siguiente salto.",
            "Mantén ritmo constante.",
            "Aterriza suave para proteger articulaciones."
        ]
    },

    pierna: {
        titulo: "Elevaciones laterales de pierna",
        video: "/img/videos/pierna.mp4",
        tiempo: {
            principiante: "2 series de 10 por pierna",
            intermedio: "3 series de 12 por pierna",
            avanzado: "4 series de 15 por pierna"
        },
        beneficios: [
            "Tonifica glúteo medio",
            "Mejora estabilidad de cadera",
            "Corrige desbalances musculares"
        ],
        instrucciones: [
            "Apóyate de una pared o silla.",
            "Levanta la pierna hacia el lateral sin rotar la cadera.",
            "Controla bajada y subida.",
            "Activa abdomen."
        ]
    },
    glute_bridge: {
        titulo: "Puente de glúteo",
        video: "/img/videos/glute_bridge.mp4",
        tiempo: {
            principiante: "2 series de 12 repeticiones",
            intermedio: "3 series de 15 repeticiones",
            avanzado: "4 series de 20 repeticiones"
    },
        beneficios: [
            "Fortalece glúteos y zona lumbar",
            "Mejora estabilidad de cadera",
            "Ayuda a aliviar dolor lumbar"
    ],
        instrucciones: [
            "Acuéstate boca arriba con rodillas flexionadas.",
            "Coloca los pies separados al ancho de cadera.",
            "Eleva la cadera apretando glúteos.",
            "Mantén 1 segundo arriba.",
            "Baja la cadera controlando el movimiento."
    ]
    },
        remo_banda: {
        titulo: "Remo con banda elástica",
        video: "/img/videos/remo_banda.mp4",
        tiempo: {
            principiante: "2 series de 10 repeticiones",
            intermedio: "3 series de 12 repeticiones",
            avanzado: "4 series de 15 repeticiones"
        },
        beneficios: [
            "Fortalece espalda alta y media",
            "Mejora postura",
            "Ayuda a reducir dolor de espalda"
        ],
        instrucciones: [
            "Siéntate o párate con la espalda recta.",
            "Sujeta la banda con ambas manos.",
            "Lleva los codos hacia atrás pegados al cuerpo.",
            "Aprieta omóplatos al final del movimiento.",
            "Regresa lentamente."
        ]
    },
        talones: {
        titulo: "Elevación de talones",
        video: "/img/videos/talones.mp4",
        tiempo: {
            principiante: "2 series de 12 repeticiones",
            intermedio: "3 series de 15 repeticiones",
            avanzado: "4 series de 20 repeticiones"
        },
        beneficios: [
            "Fortalece pantorrillas",
            "Mejora equilibrio",
            "Reduce riesgo de lesiones en tobillo"
        ],
        instrucciones: [
            "Párate con los pies al ancho de hombros.",
            "Eleva los talones lo más alto posible.",
            "Mantén 1 segundo arriba.",
            "Baja lentamente controlando el movimiento."
        ]
    },
        estiramiento_cuello: {
        titulo: "Estiramiento de cuello",
        video: "/img/videos/estiramiento_cuello.mp4",
        tiempo: {
            principiante: "2 series de 10 segundos por lado",
            intermedio: "2 series de 20 segundos por lado",
            avanzado: "3 series de 30 segundos por lado"
        },
        beneficios: [
            "Reduce tensión en cuello y hombros",
            "Disminuye dolores de cabeza por postura",
            "Mejora movilidad cervical"
        ],
        instrucciones: [
            "Lleva lentamente tu oreja hacia un hombro.",
            "Relaja hombros sin levantarlos.",
            "Mantén la postura sin forzar.",
            "Repite hacia el otro lado.",
            "Respira profundo durante el estiramiento."
        ]
    }
};


// =====================================
// CARGAR INFORMACIÓN EN LA PANTALLA
// =====================================
if (!ejercicio || !ejerciciosInfo[ejercicio]) {
    document.getElementById("titulo-ejercicio").textContent = "Ejercicio no encontrado";
} else {
    const data = ejerciciosInfo[ejercicio];

    // Título
    document.getElementById("titulo-ejercicio").textContent = data.titulo;

    // Video
    const video = document.getElementById("video-ejercicio");
    video.src = data.video;

    // Instrucciones
    const lista = document.getElementById("lista-instrucciones");
    lista.innerHTML = "";
    data.instrucciones.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        lista.appendChild(li);
    });

    // Beneficios
    const benef = document.getElementById("beneficios");
    benef.innerHTML = "";
    data.beneficios.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        benef.appendChild(li);
    });

    // Tiempo por nivel
    document.getElementById("tiempo-principiante").textContent = data.tiempo.principiante;
    document.getElementById("tiempo-intermedio").textContent = data.tiempo.intermedio;
    document.getElementById("tiempo-avanzado").textContent = data.tiempo.avanzado;
}
