// ==============================
//  Mostrar / ocultar contraseña
// ==============================
function toggleRegPass() {
    let pass = document.getElementById("regPass");
    pass.type = pass.type === "password" ? "text" : "password";
}

// ==============================
//  Validación en vivo
// ==============================
const passInput = document.getElementById("regPass");

passInput.addEventListener("input", () => {

    // Máximo 8 caracteres
    if (passInput.value.length > 8) {
        passInput.value = passInput.value.slice(0, 8);
    }

    const value = passInput.value;

    document.getElementById("len").classList.toggle("valid", value.length === 8);
    document.getElementById("mayus").classList.toggle("valid", /[A-Z]/.test(value));
    document.getElementById("especial").classList.toggle("valid", /[@#$%&*!?]/.test(value));
});

// ==============================
//  Enviar formulario
// ==============================
document.getElementById("formRegistro").addEventListener("submit", function(e) {
    e.preventDefault();

    const pass = this.contrasena.value;

    if (
        pass.length !== 8 ||
        !/[A-Z]/.test(pass) ||
        !/[@#$%&*!?]/.test(pass)
    ) {
        alert("⚠ La contraseña no cumple con los requisitos.");
        return;
    }

    let data = {
        nombre: this.nombre.value,
        correo: this.correo.value,
        contrasena: this.contrasena.value,
        tipo: this.tipo.value
    };

    fetch("http://localhost:3000/registrar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {

            if (result.status === "OK") {
                alert("🎉 Cuenta creada con éxito");

                // Guardar usuario recién creado para mostrar perfil
                localStorage.setItem("usuario", JSON.stringify(result.usuario));

                // Redirigir al catálogo
                window.location.href = "/pages/Catalogos/catalogo.html";
            }
            else if (result.status === "EXISTE") {
                alert("❌ Ya existe un usuario con este correo.");
            }
            else {
                alert("⚠ Hubo un error inesperado: " + JSON.stringify(result));
            }
        })
        .catch(err => {
            console.error(err);
            alert("❌ Error conectando con el servidor.");
        });
});
