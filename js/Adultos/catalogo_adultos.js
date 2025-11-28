const ejercicios_adultos = [
    { 
        nombre: "Marcha en el lugar", 
        img: "/img/marchaEnLugar.jpg", 
        ruta: "/pages/demostracion_adultos.html?ejercicio=marcha" 
    },
    { 
        nombre: "Levantamiento de talones", 
        img: "/img/levantamientodetalones.jpg", 
        ruta: "/pages/demostracion_adultos.html?ejercicio=talones_adulto" 
    },
    { 
        nombre: "Sentarse y pararse", 
        img: "/img/sentarseypararse.png", 
        ruta: "/pages/demostracion_adultos.html?ejercicio=sentarse" 
    },
    { 
        nombre: "Elevación de brazos",
        img: "/img/elevaciondebrazo.jpg",
        ruta: "/pages/demostracion_adultos.html?ejercicio=brazos_adulto"
    },
    { 
        nombre: "Círculos de hombro",
        img: "/img/circulodehombros.jpg",
        ruta: "/pages/demostracion_adultos.html?ejercicio=hombros_adulto"
    },
    { 
        nombre: "Extensión de pierna sentad@", 
        img: "/img/extensionpierna.jpg", 
        ruta: "/pages/demostracion_adultos.html?ejercicio=pierna_adulto" 
    }
];

const gridAdultos = document.getElementById("catalogoGrid");

ejercicios_adultos.forEach(e => {
    const card = document.createElement("a");
    card.classList.add("card");
    card.href = e.ruta;

    card.innerHTML = `
        <img src="${e.img}" alt="${e.nombre}">
        <h3>${e.nombre}</h3>
    `;

    gridAdultos.appendChild(card);
});
