const ejercicios = [
    { nombre: "Sentadillas básicas", img: "../img/sentadilla.jpg", ruta: "demostracion.html?ejercicio=sentadillas" },
    { nombre: "Desplantes", img: "../img/desplantes.jpg", ruta: "demostracion.html?ejercicio=desplantes" },
    { nombre: "Elevaciones de brazo", img: "../img/elevacion_brazo.jpg", ruta: "demostracion.html?ejercicio=elevaciones_brazo" },
    { nombre: "Flexiones de pared", img: "../img/flexion_pared.jpg", ruta: "demostracion.html?ejercicio=flexiones_pared" },
    { nombre: "Plancha básica", img: "../img/plancha.jpg", ruta: "demostracion.html?ejercicio=plancha" },
    { nombre: "Elevación de rodillas", img: "../img/rodillas.jpg", ruta: "demostracion.html?ejercicio=rodillas" },
    { nombre: "Jumping jacks modificados", img: "../img/jumping.jpg", ruta: "demostracion.html?ejercicio=jumping" },
    { nombre: "Elevaciones laterales de pierna", img: "../img/pierna.jpg", ruta: "demostracion.html?ejercicio=pierna" }
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
