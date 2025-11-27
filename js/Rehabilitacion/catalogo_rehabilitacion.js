const ejercicios_rehab = [
    { 
        nombre: "Movilidad de hombro con banda", 
        img: "/img/hombro_banda.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=hombro_banda" 
    },
    { 
        nombre: "Elevación de pierna acostado", 
        img: "/img/elevacion_pierna.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=elevacion_pierna_rehab" 
    },
    { 
        nombre: "Caminata lateral con banda", 
        img: "/img/rehab/caminata_banda.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=caminata_banda" 
    },
    { 
        nombre: "Extensión de rodilla", 
        img: "/img/rehab/rodilla.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=rodilla_rehab" 
    },
    { 
        nombre: "Estiramiento lumbar", 
        img: "/img/rehab/lumbar.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=lumbar" 
    },
    { 
        nombre: "Movilidad de tobillo", 
        img: "/img/rehab/tobillo.jpg", 
        ruta: "/pages/demostracion.html?ejercicio=tobillo_rehab" 
    }
];

const gridRehab = document.getElementById("catalogoGrid");

ejercicios_rehab.forEach(e => {
    const card = document.createElement("a");
    card.classList.add("card");
    card.href = e.ruta;

    card.innerHTML = `
        <img src="${e.img}" alt="${e.nombre}">
        <h3>${e.nombre}</h3>
    `;

    gridRehab.appendChild(card);
});
