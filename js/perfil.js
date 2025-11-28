let usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    // No se rompe, solo avisa y redirige ✅
    alert("No hay sesión activa, inicia sesión.");
    window.location.href = "/index.html";
    throw new Error("Sin sesión");
}

// Mostrar datos solo cuando hay sesión ✅
document.getElementById("nombreUsuario").textContent = usuario.nombre;
document.getElementById("correoUsuario").textContent = usuario.correo;
document.getElementById("tipoUsuario").textContent = usuario.tipo;
document.getElementById("fechaRegistro").textContent = usuario.fecha_registro;

let foto = localStorage.getItem("fotoPerfil");
document.getElementById("perfil-img").src = foto || usuario.fotoPerfil || "/img/user_default.png";

function cerrarSesion() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoPerfil");
    window.location.href = "/index.html";
}
