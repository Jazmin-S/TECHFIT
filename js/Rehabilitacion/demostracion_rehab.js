const infoRehab = {

    // 1. MOVILIDAD DE HOMBRO CON BANDA
    hombro_banda: {
        titulo: "Movilidad de hombro con banda",
        video: "/videos/rehab/hombro_banda.mp4",
        instrucciones: [
            "Toma la banda con ambas manos a la altura de los hombros.",
            "Mantén los codos ligeramente flexionados.",
            "Eleva los brazos por encima de la cabeza lentamente.",
            "Evita bloquear los codos y no arquees la espalda.",
            "Regresa a la posición inicial controlando el movimiento."
        ],
        tiempos: { p: "10 seg", i: "20 seg", a: "30 seg" },
        beneficios: [
            "Mejora la movilidad del hombro.",
            "Reduce rigidez y dolor articular.",
            "Fortalece manguito rotador.",
            "Ayuda en recuperación post-inmovilización."
        ]
    },

    // 2. ELEVACIÓN DE PIERNA ACOSTADO
    elevacion_pierna_rehab: {
        titulo: "Elevación de pierna acostado",
        video: "/videos/rehab/elevacion_pierna.mp4",
        instrucciones: [
            "Acuéstate boca arriba con una pierna flexionada.",
            "Mantén la otra pierna estirada.",
            "Eleva la pierna recta hasta 45° sin doblar la rodilla.",
            "Controla la bajada y repite.",
            "Evita arquear la zona lumbar."
        ],
        tiempos: { p: "15 seg", i: "25 seg", a: "40 seg" },
        beneficios: [
            "Fortalece el psoas y cuádriceps.",
            "Mejora la estabilidad de la cadera.",
            "Disminuye molestias en rodilla.",
            "Excelente en recuperación de LCA y desbalances musculares."
        ]
    },

    // 3. CAMINATA LATERAL CON BANDA
    caminata_banda: {
        titulo: "Caminata lateral con banda",
        video: "/videos/rehab/caminata_banda.mp4",
        instrucciones: [
            "Coloca la banda en los tobillos o rodillas.",
            "Flexiona ligeramente las rodillas.",
            "Da pasos laterales sin juntar completamente los pies.",
            "Mantén el abdomen firme.",
            "Evita que las rodillas colapsen hacia adentro."
        ],
        tiempos: { p: "15 seg", i: "25 seg", a: "35 seg" },
        beneficios: [
            "Activa glúteo medio y menor.",
            "Mejora estabilidad de cadera y rodillas.",
            "Ayuda a prevenir lesiones.",
            "Corrige valgo de rodilla."
        ]
    },

    // 4. EXTENSIÓN DE RODILLA
    rodilla_rehab: {
        titulo: "Extensión de rodilla",
        video: "/videos/rehab/rodilla.mp4",
        instrucciones: [
            "Siéntate en una silla con la espalda recta.",
            "Estira una pierna lentamente hasta extender completamente.",
            "Mantén 1–2 segundos arriba.",
            "Baja controlando el movimiento.",
            "Evita movimientos bruscos."
        ],
        tiempos: { p: "10 seg", i: "20 seg", a: "30 seg" },
        beneficios: [
            "Fortalece cuádriceps.",
            "Ayuda en recuperación de lesiones de rodilla.",
            "Mejora estabilidad en caminata.",
            "Reduce dolor patelofemoral."
        ]
    },

    // 5. ESTIRAMIENTO LUMBAR
    lumbar: {
        titulo: "Estiramiento lumbar",
        video: "/videos/rehab/lumbar.mp4",
        instrucciones: [
            "Acuéstate boca arriba.",
            "Lleva tus rodillas al pecho con ambas manos.",
            "Mantén la zona lumbar relajada.",
            "Respira profundamente durante el estiramiento.",
            "Regresa lentamente a la posición inicial."
        ],
        tiempos: { p: "20 seg", i: "30 seg", a: "45 seg" },
        beneficios: [
            "Reduce tensión en zona lumbar.",
            "Mejora flexibilidad de la espalda.",
            "Alivia molestias por mala postura.",
            "Ideal en rehabilitación por lumbalgia."
        ]
    },

    // 6. MOVILIDAD DE TOBILLO
    tobillo_rehab: {
        titulo: "Movilidad de tobillo",
        video: "/videos/rehab/tobillo.mp4",
        instrucciones: [
            "Siéntate con una pierna estirada.",
            "Lleva el pie hacia arriba (flexión dorsal).",
            "Llévalo hacia abajo (flexión plantar).",
            "Realiza círculos con el tobillo hacia ambos lados.",
            "Mantén movimientos lentos y controlados."
        ],
        tiempos: { p: "15 seg", i: "25 seg", a: "40 seg" },
        beneficios: [
            "Mejora movilidad del tobillo.",
            "Reduce rigidez tras esguinces.",
            "Ayuda a recuperar estabilidad.",
            "Mejora mecánica de marcha."
        ]
    }
};


// ---------------------
//   CONTROL DE PÁGINA
// ---------------------

const q = new URLSearchParams(window.location.search);
const ej = q.get("ejercicio");
const d2 = infoRehab[ej];

// TITULO
document.getElementById("titulo-ejercicio").textContent = d2.titulo;

// VIDEO
document.getElementById("video-ejercicio").src = d2.video;

// INSTRUCCIONES
d2.instrucciones.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    document.getElementById("lista-instrucciones").appendChild(li);
});

// TIEMPOS
document.getElementById("tiempo-principiante").textContent = d2.tiempos.p;
document.getElementById("tiempo-intermedio").textContent = d2.tiempos.i;
document.getElementById("tiempo-avanzado").textContent = d2.tiempos.a;

// BENEFICIOS
d2.beneficios.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    document.getElementById("beneficios").appendChild(li);
});

// BOTÓN INICIAR
document.getElementById("btnIniciar").onclick = () => {
    window.location.href = `/pages/ejecucion_rehabilitacion.html?ejercicio=${ej}`;
};
