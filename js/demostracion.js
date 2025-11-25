// Obtener parámetro de la URL
const params = new URLSearchParams(window.location.search);
const ejercicio = params.get("ejercicio");

// BASE DE DATOS COMPLETA DE EJERCICIOS
const ejercicios = {
    sentadillas: {
        titulo: "Sentadillas básicas",
        video: "../img/videos/sentadillas.mp4",
        instrucciones: [
            "Coloca los pies al ancho de los hombros.",
            "Mantén la espalda recta y el abdomen activado.",
            "Lleva la cadera hacia atrás como si fueras a sentarte.",
            "Baja flexionando las rodillas sin que pasen la punta de los pies.",
            "Mantén el pecho elevado y la vista al frente.",
            "Sube empujando desde los talones hasta regresar a la posición inicial.",
            "Realiza el movimiento de forma controlada, sin rebotes.",
            "Respira al bajar y exhala al subir."
        ],
        duracion: `
Principiantes: 30–45 segundos  
Descanso: 15–20 segundos  
Series: 3  

Intermedio: 45–60 segundos  
Descanso: 15–20 segundos  
Series: 3 a 4
        `,
        beneficios: [
            "Fortalece glúteos, piernas y zona media.",
            "Mejora la movilidad de cadera y rodillas.",
            "Ayuda a mejorar la postura corporal.",
            "Reduce la rigidez lumbar y de cadera.",
            "Ejercicio seguro y de bajo impacto."
        ]
    },

    desplantes: {
        titulo: "Desplantes",
        video: "../img/videos/desplantes.mp4",
        instrucciones: [
            "Da un paso amplio hacia adelante.",
            "Mantén el torso erguido y el abdomen activado.",
            "Flexiona ambas rodillas en un ángulo de 90°.",
            "La rodilla trasera baja hacia el suelo sin tocarlo.",
            "Impulsa con la pierna delantera para volver.",
            "Alterna ambas piernas manteniendo equilibrio.",
            "Evita que la rodilla delantera se vaya hacia adentro.",
            "Mantén un ritmo lento y controlado."
        ],
        duracion: `
Principiantes: 20–30 segundos  
Intermedio: 45 segundos  
Series: 3
        `,
        beneficios: [
            "Fortalece glúteos, cuádriceps e isquiotibiales.",
            "Mejora estabilidad y equilibrio.",
            "Ayuda a corregir asimetrías musculares.",
            "Ideal para tonificación de piernas.",
            "Mejora coordinación motriz."
        ]
    },

    elevaciones_brazo: {
        titulo: "Elevaciones de brazo",
        video: "../img/videos/elevacion_brazo.mp4",
        instrucciones: [
            "Colócate de pie con pies separados al ancho de cadera.",
            "Mantén la espalda recta y el abdomen firme.",
            "Levanta un brazo hacia el frente sin bloquear el codo.",
            "Evita encoger los hombros.",
            "Baja el brazo lentamente.",
            "Repite con el otro brazo.",
            "Controla la respiración: exhala al levantar.",
            "Puedes usar pesas ligeras si deseas aumentar dificultad."
        ],
        duracion: `
Principiantes: 20–30 segundos  
Intermedio: 40–50 segundos  
Series: 3
        `,
        beneficios: [
            "Fortalece deltoides y hombros.",
            "Mejora movilidad articular.",
            "Ideal para rehabilitación de hombro.",
            "Aumenta resistencia del tren superior.",
            "Ayuda a corregir postura."
        ]
    },

    flexiones_pared: {
        titulo: "Flexiones en pared",
        video: "../img/videos/flexion_pared.mp4",
        instrucciones: [
            "Colócate frente a una pared a medio metro de distancia.",
            "Apoya las manos a la altura del pecho.",
            "Mantén el cuerpo alineado (sin arquear la espalda).",
            "Flexiona los codos y acerca el pecho a la pared.",
            "Empuja para volver a la posición inicial.",
            "Controla la respiración durante el movimiento.",
            "Evita que los codos se abran demasiado.",
            "Perfecto para principiantes o rehabilitación."
        ],
        duracion: `
Principiantes: 20–30 segundos  
Intermedio: 45 segundos  
Series: 3
        `,
        beneficios: [
            "Fortalece pecho, hombros y tríceps.",
            "Mejora estabilidad de muñecas.",
            "Evita compresión excesiva del hombro.",
            "Ideal para adultos mayores o lesiones.",
            "Aumenta fuerza funcional."
        ]
    },

    plancha: {
        titulo: "Plancha básica",
        video: "../img/videos/plancha.mp4",
        instrucciones: [
            "Coloca antebrazos y puntas de los pies en el suelo.",
            "Activa el abdomen manteniendo la espalda recta.",
            "Evita elevar demasiado la cadera.",
            "Mantén el cuello alineado con la columna.",
            "Respira de manera suave y constante.",
            "No arquees la zona lumbar.",
            "Mantén la tensión sin bloquear la respiración.",
            "Ideal para fortalecer abdomen profundo."
        ],
        duracion: `
Principiantes: 15–25 segundos  
Intermedio: 30–45 segundos  
Series: 3
        `,
        beneficios: [
            "Fortalece abdomen completo.",
            "Reduce dolor lumbar.",
            "Mejora postura y equilibrio.",
            "Activa glúteos y espalda baja.",
            "Ejercicio de bajo impacto y muy seguro."
        ]
    },

    rodillas: {
        titulo: "Elevación de rodillas",
        video: "../img/videos/rodillas.mp4",
        instrucciones: [
            "Mantente de pie con postura recta.",
            "Eleva una rodilla hacia el pecho sin inclinarte.",
            "Activa el abdomen durante el movimiento.",
            "Alterna piernas a un ritmo controlado.",
            "No golpees el pie contra el suelo al bajar.",
            "Evita inclinar el torso hacia atrás.",
            "Respira coordinado con las repeticiones."
        ],
        duracion: `
Principiantes: 20–30 segundos  
Intermedio: 45 segundos  
Series: 3
        `,
        beneficios: [
            "Mejora coordinación y equilibrio.",
            "Aumenta resistencia cardiovascular leve.",
            "Activa abdomen y flexores de cadera.",
            "Ideal para entrar en calor.",
            "Mejora movilidad de piernas."
        ]
    },

    jumping: {
        titulo: "Jumping jacks modificados",
        video: "../img/videos/jumping.mp4",
        instrucciones: [
            "Da un paso lateral y eleva ambos brazos.",
            "Regresa al centro y cambia al otro lado.",
            "Mantén las rodillas ligeramente flexionadas.",
            "Evita impacto fuerte sobre tobillos.",
            "Controla el movimiento de brazos.",
            "Mantén respiración constante.",
            "Perfecto como cardio ligero o calentamiento."
        ],
        duracion: `
Principiantes: 20–30 segundos  
Intermedio: 40–50 segundos  
Series: 3
        `,
        beneficios: [
            "Aumenta resistencia cardiovascular.",
            "Activa brazos, piernas y core.",
            "Mejora coordinación.",
            "Cardio de bajo impacto.",
            "Ayuda a quemar calorías."
        ]
    },

    pierna: {
        titulo: "Elevaciones laterales de pierna",
        video: "../img/videos/pierna.mp4",
        instrucciones: [
            "Acuéstate de lado apoyando el codo.",
            "Mantén piernas alineadas.",
            "Eleva la pierna superior lentamente.",
            "Evita rotar la cadera hacia atrás.",
            "Baja con control sin dejar caer la pierna.",
            "Cambia al otro lado después de terminar.",
            "Controla tu respiración durante el movimiento."
        ],
        duracion: `
Principiantes: 12–15 repeticiones por lado  
Intermedio: 20 repeticiones  
Series: 3
        `,
        beneficios: [
            "Fortalece glúteo medio.",
            "Mejora estabilidad de cadera.",
            "Previene dolor lumbar.",
            "Tonifica piernas y glúteos.",
            "Ideal para fortalecer abductores."
        ]
    }
};

// ------------------------ MOSTRAR DATOS ------------------------

if (ejercicios[ejercicio]) {

    const data = ejercicios[ejercicio];

    // Título
    document.getElementById("titulo-ejercicio").textContent = data.titulo;

    // Video
    const contenedorDemo = document.getElementById("imagen-ejercicio");
    contenedorDemo.outerHTML = `
        <video class="img-demo" controls>
            <source src="${data.video}" type="video/mp4">
            Tu navegador no soporta video.
        </video>
    `;

    // Instrucciones
    const instList = document.getElementById("lista-instrucciones");
    data.instrucciones.forEach(paso => {
        const li = document.createElement("li");
        li.textContent = paso;
        instList.appendChild(li);
    });

    // Duración
    document.getElementById("texto-duracion").innerText = data.duracion;

    // Beneficios
    const beneList = document.getElementById("lista-beneficios");
    data.beneficios.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        beneList.appendChild(li);
    });

} else {
    document.getElementById("titulo-ejercicio").textContent = "Ejercicio no encontrado.";
}

// ------------------------ BOTÓN INICIAR ------------------------

// Esto hace que el botón lleve a pages/ejecucion.html (misma carpeta que demostracion.html)
const btnIniciar = document.getElementById("btnIniciar");
if (btnIniciar) {
    btnIniciar.addEventListener("click", () => {
        // Como demostracion.html está en /pages/, usamos ruta relativa al mismo folder:
       window.location.href = `ejecucion.html?ejercicio=${ejercicio}`;

        // Si por alguna razón tu archivo estuviera en otra ruta, aquí cambiarías la URL.
    });
}
