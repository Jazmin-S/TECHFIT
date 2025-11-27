// ============================
// VERIFICAR SESIÓN
// ============================
let usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "/index.html";
}

// ============================
// MOSTRAR DATOS
// ============================
document.getElementById("nombreUsuario").textContent = usuario.nombre;
document.getElementById("correoUsuario").textContent = usuario.correo;
document.getElementById("tipoUsuario").textContent = usuario.tipo || usuario.tipo_usuario;
document.getElementById("fechaRegistro").textContent = usuario.fecha_registro || "N/A";

// ============================
// MOSTRAR FOTO GUARDADA
// ============================
let fotoGuardada = localStorage.getItem("fotoPerfil");
if (fotoGuardada) {
    document.getElementById("perfil-img").src = fotoGuardada;
}

// ============================
// CAMBIO DE FOTO
// ============================
document.getElementById("perfil-img").addEventListener("click", () => {
    document.getElementById("inputFoto").click();
});

document.getElementById("inputFoto").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        localStorage.setItem("fotoPerfil", e.target.result);
        document.getElementById("perfil-img").src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// ============================
// CERRAR SESIÓN
// ============================
function cerrarSesion() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoPerfil");
    window.location.href = "/index.html";
}
