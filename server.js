const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ---------------------------
// 🔓 Middlewares
// ---------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------------
// 🛢 Conexión MySQL
// ---------------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",   // tu contraseña
    database: "techfit"
});

db.connect(err => {
    if (err) throw err;
    console.log("✔ Conectado a MySQL");
});

// ---------------------------
// 👤 Registrar usuario
// ---------------------------
app.post("/registrar", (req, res) => {
    const { nombre, correo, contrasena, tipo } = req.body;

    const sql = `
        INSERT INTO usuarios (nombre, correo, contrasena, tipo_usuario)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nombre, correo, contrasena, tipo], (err) => {
        if (err) {
            console.log(err);
            return res.json({ status: "ERROR", error: err });
        }
        return res.json({ status: "OK" });
    });
});

// ---------------------------
// 🔐 Login (CORREGIDO)
// ---------------------------
app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = "SELECT * FROM usuarios WHERE correo = ? LIMIT 1";

    db.query(sql, [correo], (err, results) => {
        if (err) return res.json({ status: "ERROR", error: err });

        if (results.length === 0) {
            return res.json({ status: "NO_EXISTE" });
        }

        const usuario = results[0];

        if (usuario.contrasena === contrasena) {

            // 🚀 Aquí enviamos el usuario COMPLETO al frontend
            return res.json({
                status: "OK",
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    tipo_usuario: usuario.tipo_usuario,
                    fecha_registro: usuario.fecha_registro
                }
            });
        } 
        else {
            return res.json({ status: "CONTRA_INCORRECTA" });
        }
    });
});

// ---------------------------
// 🚀 Iniciar servidor
// ---------------------------
app.listen(3000, () => {
    console.log("🔥 Servidor Node.js corriendo en http://localhost:3000");
});
