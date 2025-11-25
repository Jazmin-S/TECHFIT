function toggleLoginPass() {
    let pass = document.getElementById("loginPass");
    pass.type = pass.type === "password" ? "text" : "password";
}

// Limitar a 8 caracteres
const loginInput = document.getElementById("loginPass");
loginInput.addEventListener("input", () => {
    if (loginInput.value.length > 8) {
        loginInput.value = loginInput.value.slice(0, 8);
    }
});

document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();

    let data = {
        correo: this.correo.value,
        contrasena: this.contrasena.value
    };

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {

            if (result.status === "OK") {

                if (!result.usuario) {
                    alert("⚠ El backend NO está enviando el objeto usuario.");
                    return;
                }

                // Guardar usuario
                localStorage.setItem("usuario", JSON.stringify(result.usuario));

                // Redirigir
                window.location.href = "pages/catalogo.html";
            }
            else if (result.status === "CONTRA_INCORRECTA") {
                alert("La contraseña es incorrecta");
            }
            else if (result.status === "NO_EXISTE") {
                alert("No existe una cuenta con ese correo");
            }
            else {
                alert("Error al iniciar sesión");
            }
        })
        .catch(err => {
            console.error("Error al conectar con backend:", err);
            alert("No se pudo conectar al servidor.");
        });
});

