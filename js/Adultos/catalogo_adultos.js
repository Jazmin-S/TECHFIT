const ejercicios_adultos = [
    { 
        nombre: "Marcha en el lugar", 
        img: "/img/adultos/marcha.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=marcha" 
    },
    { 
        nombre: "Levantamiento de talones", 
        img: "/img/adultos/talones.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=talones_adulto" 
    },
    { 
        nombre: "Sentarse y pararse", 
        img: "/img/adultos/sentarse.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=sentarse" 
    },
    { 
        nombre: "Elevación de brazos",
        img: "/img/adultos/brazos.jpg",
        ruta: "/pages/demostracion.html?ejercicio=brazos_adulto"
    },
    { 
        nombre: "Círculos de hombro",
        img: "/img/adultos/hombros.jpg",
        ruta: "/pages/demostracion.html?ejercicio=hombros_adulto"
    },
    { 
        nombre: "Extensión de pierna sentad@", 
        img: "/img/adultos/pierna.jpg", 
        ruta: "../pages/demostracion.html?ejercicio=pierna_adulto" 
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
