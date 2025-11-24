const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 📌 Conexión a MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",   // coloca tu contraseña si tiene
    database: "techfit"
});

db.connect(err => {
    if (err) throw err;
    console.log("✔ Conectado a MySQL");
});

// 📌 Registrar usuario
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

// 📌 Login
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
            return res.json({ status: "OK" });
        } else {
            return res.json({ status: "CONTRA_INCORRECTA" });
        }
    });
});

// Servidor
app.listen(3000, () => {
    console.log("🔥 Servidor Node.js corriendo en http://localhost:3000");
});
