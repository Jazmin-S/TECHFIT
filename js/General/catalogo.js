const ejercicios = [
    { 
        nombre: "Sentadillas", 
        img: "/img/sentadilla.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=sentadillas" 
    },
    { 
        nombre: "Desplantes", 
        img: "/img/desplantes.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=desplantes" 
    },
    { 
        nombre: "Elevaciones de brazo", 
        img: "/img/elevacion_brazo.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=elevaciones_brazo" 
    },
    { 
        nombre: "Flexiones de pared", 
        img: "/img/flexion_pared.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=flexiones_pared" 
    },
    { 
        nombre: "Plancha", 
        img: "/img/plancha.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=plancha" 
    },
    { 
        nombre: "Elevación de rodillas", 
        img: "/img/rodillas.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=rodillas" 
    },
    { 
        nombre: "Jumping jacks", 
        img: "/img/jumping.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=jumping" 
    },
    { 
        nombre: "Elevaciones laterales de pierna", 
        img: "/img/pierna.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=pierna" 
    },
    {   nombre: "Puente de glúteo",
        img: "/img/glute_bridge.jpg",
        ruta: "/pages/demostracion.html?ejercicio=glute_bridge"
    },
    {   nombre: "Remo con banda",
        img: "/img/remo_banda.jpg",
        ruta: "/pages/demostracion.html?ejercicio=remo_banda"
    },
    {   nombre: "Elevación de talones",
        img: "/img/talones.jpg",
        ruta: "/pages/demostracion.html?ejercicio=talones"
    },
    {   nombre: "Estiramiento de cuello",
        img: "/img/estiramiento_cuello.jpg",
        ruta: "/pages/demostracion.html?ejercicio=estiramiento_cuello"
    }
];

const grid = document.getElementById("catalogoGrid");

ejercicios.forEach(e => {
    const card = document.createElement("a");
    card.classList.add("card");
    card.href = e.ruta;

    card.innerHTML = `
        <img src="${e.img}" alt="${e.nombre}">
        <h3>${e.nombre}</h3>
    `;

    grid.appendChild(card);
});
