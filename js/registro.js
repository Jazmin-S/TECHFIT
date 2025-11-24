function toggleRegPass() {
    let pass = document.getElementById("regPass");
    pass.type = pass.type === "password" ? "text" : "password";
}

// Validación dinámica
const passInput = document.getElementById("regPass");
passInput.addEventListener("input", () => {

    // 🔒 Evitar más de 8 caracteres escribiendo o pegando
    if (passInput.value.length > 8) {
        passInput.value = passInput.value.slice(0, 8);
    }

    const value = passInput.value;

    document.getElementById("len").classList.toggle("valid", value.length === 8);
    document.getElementById("mayus").classList.toggle("valid", /[A-Z]/.test(value));
    document.getElementById("especial").classList.toggle("valid", /[@#$%&*!?]/.test(value));
});

// Enviar formulario
document.getElementById("formRegistro").addEventListener("submit", function(e){
    e.preventDefault();

    const pass = this.contrasena.value;

    // Requisitos
    if (
        pass.length !== 8 ||
        !/[A-Z]/.test(pass) ||
        !/[@#$%&*!?]/.test(pass)
    ) {
        alert("La contraseña no cumple los requisitos.");
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
            alert("Cuenta creada con éxito 🎉");
            window.location.href = "catalogo.html";
        } else {
            alert("Error: " + JSON.stringify(result));
        }
    });
});
