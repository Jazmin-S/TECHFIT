// ================================
//  Mostrar / ocultar contraseña
// ================================
function toggleLoginPass() {
    let pass = document.getElementById("loginPass");
    pass.type = pass.type === "password" ? "text" : "password";
}

// ================================
//  Limitar a 8 caracteres
// ================================
const loginInput = document.getElementById("loginPass");

loginInput.addEventListener("input", () => {
    if (loginInput.value.length > 8) {
        loginInput.value = loginInput.value.slice(0, 8);
    }
});

// ================================
//  LOGIN
// ================================
document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
        correo: this.correo.value.trim(),
        contrasena: this.contrasena.value.trim()
    };

    if (!data.correo || !data.contrasena) {
        alert("🔔 Por favor completa todos los campos");
        return;
    }

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {

            if (result.status === "OK") {

                if (!result.usuario) {
                    alert("⚠ El servidor no envió datos del usuario.");
                    return;
                }

                // Guardar en localStorage
                localStorage.setItem("usuario", JSON.stringify(result.usuario));

                // Redirigir
                window.location.href = "/pages/Catalogos/catalogo.html";
            }
            else if (result.status === "CONTRA_INCORRECTA") {
                alert("❌ Contraseña incorrecta");
            }
            else if (result.status === "NO_EXISTE") {
                alert("❌ No existe cuenta con ese correo");
            }
            else {
                alert("⚠ Error al iniciar sesión");
            }
        })
        .catch(err => {
            console.error("Error al conectar:", err);
            alert("❌ No se pudo conectar al servidor.");
        });
});
