const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// 🔓 Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🛢 Conexión MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "techfit"
});

db.connect(err => {
    if (err) throw err;
    console.log("✔ Conectado a MySQL");
});

// 👤 Registrar usuario  (ahora solo devuelve OK, sin usuario, sin login)
app.post("/registrar", (req, res) => {
    const { nombre, correo, contrasena, tipo } = req.body;

    // Verificar si ya existe
    db.query("SELECT correo FROM usuarios WHERE correo = ? LIMIT 1", [correo], (err, existe) => {
        if (err) return res.json({ status: "ERROR", error: err });
        if (existe.length > 0) return res.json({ status: "EXISTE" });

        const sql = `
            INSERT INTO usuarios (nombre, correo, contrasena, tipo_usuario, fecha_registro)
            VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(sql, [nombre, correo, contrasena, tipo], (errInsert) => {
            if (errInsert) {
                console.log(errInsert);
                return res.json({ status: "ERROR", error: errInsert });
            }

            // Solo confirmar creación, sin login automático ✅
            return res.json({ status: "OK" });
        });
    });
});

// 🔐 Login
app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = "SELECT * FROM usuarios WHERE correo = ? LIMIT 1";

    db.query(sql, [correo], (err, results) => {
        if (err) return res.json({ status: "ERROR", error: err });
        if (results.length === 0) return res.json({ status: "NO_EXISTE" });

        const usuario = results[0];

        if (usuario.contrasena === contrasena) {
            return res.json({
                status: "OK",
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    tipo: usuario.tipo_usuario,
                    fecha_registro: usuario.fecha_registro,
                    fotoPerfil: usuario.fotoPerfil || "/img/user_default.png"
                }
            });
        } else {
            return res.json({ status: "CONTRA_INCORRECTA" });
        }
    });
});

// 🚀 Iniciar servidor
app.listen(3000, () => {
    console.log("🔥 Servidor Node.js corriendo en http://localhost:3000");
});
