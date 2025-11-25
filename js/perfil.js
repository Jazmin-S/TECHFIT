let rawUser = localStorage.getItem("usuario");

if (!rawUser || rawUser === "undefined") {
    alert("No hay sesión iniciada.");
    window.location.href = "../index.html";
}

let usuario = {};

try {
    usuario = JSON.parse(rawUser);
} catch (e) {
    alert("Error al leer datos de usuario.");
    localStorage.clear();
    window.location.href = "../index.html";
}

// Mostrar datos
document.getElementById("nombreUsuario").textContent = usuario.nombre;
document.getElementById("correoUsuario").textContent = usuario.correo;
document.getElementById("tipoUsuario").textContent = usuario.tipo_usuario;
document.getElementById("fechaRegistro").textContent = usuario.fecha_registro;

// Puedes personalizar descripción según tipo:
const desc = document.getElementById("descripcionUsuario");

if (usuario.tipo_usuario === "general") {
    desc.textContent = "Usuario general con rutinas de ejercicio recomendadas por TECHFIT.";
} else if (usuario.tipo_usuario === "rehabilitacion") {
    desc.textContent = "Usuario de rehabilitación con ejercicios especializados y especializados.";
} else if (usuario.tipo_usuario === "adulto_mayor") {
    desc.textContent = "Usuario adulto mayor con rutinas adaptadas y con la mejor probabilidad de ayuda.";
}
