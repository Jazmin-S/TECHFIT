const ejercicios_rehab = [
    { 
        nombre: "Elevación de pierna acostado", 
        img: "/img/elevacion_pierna.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=elevacion_pierna_rehab" 
    },
    { 
        nombre: "Caminata lateral con banda", 
        img: "/img/caminata_banda.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=caminata_banda" 
    },
    { 
        nombre: "Extensión de rodilla", 
        img: "/img/rodilla.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=rodilla_rehab" 
    },
    { 
        nombre: "Estiramiento lumbar", 
        img: "/img/lumbar.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=lumbar" 
    },
    { 
        nombre: "Movilidad de tobillo", 
        img: "/img/tobillo.jpg", 
        ruta: "/pages/demostracion_rehabilitacion.html?ejercicio=tobillo_rehab" 
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
// ============================
// CERRAR SESIÓN desde menú
// ============================
function cerrarSesion() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoPerfil");
    window.location.href = "/index.html"; // ← mandar a index como quieres ✅
}

// Conectar botón del sidebar
document.getElementById("logoutBtn")?.addEventListener("click", cerrarSesion);
