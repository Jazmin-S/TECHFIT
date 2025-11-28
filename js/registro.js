function toggleRegPass() {
  const p = document.getElementById("regPass");
  p.type = p.type === "password" ? "text" : "password";
}

// Validación en vivo
const passLive = document.getElementById("regPass");
passLive.addEventListener("input", () => {
  if (passLive.value.length > 8) {
    passLive.value = passLive.value.slice(0, 8);
  }
  const v = passLive.value;
  document.getElementById("len")?.classList.toggle("valid", v.length === 8);
  document.getElementById("mayus")?.classList.toggle("valid", /[A-Z]/.test(v));
  document.getElementById("especial")?.classList.toggle("valid", /[@#$%&*!?]/.test(v));
});

// Enviar formulario registro
document.getElementById("formRegistro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = this.nombre.value;
  const correo = this.correo.value;
  const contrasena = this.contrasena.value;
  const tipo = this.tipo.value;

  if (contrasena.length !== 8 || !/[A-Z]/.test(contrasena) || !/[@#$%&*!?]/.test(contrasena)) {
    alert("⚠ La contraseña no cumple.");
    return;
  }

  const data = { nombre, correo, contrasena, tipo };

  try {
    const r = await fetch("http://localhost:3000/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resp = await r.json();

    if (resp.status === "OK") {
      alert("🎉 Cuenta creada con éxito");

      // No guardamos sesión, no login automático ❗✅

      // Regresar a index como pediste ✔
      window.location.href = "/index.html";
    }
    else if (resp.status === "EXISTE") {
      alert("❌ Este correo ya está registrado.");
    }
    else {
      alert("❌ Error: " + JSON.stringify(resp));
    }

  } catch (err) {
    console.error(err);
    alert("❌ No se pudo conectar.");
  }
});
