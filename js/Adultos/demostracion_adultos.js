const infoAdultos = {
    marcha: {
        titulo: "Marcha en el lugar",
        video: "/videos/adultos/marcha.mp4",
        instrucciones: [
            "Marcha suavemente",
            "Mantén equilibrio",
            "Respira tranquilo"
        ],
        tiempos: { p: "20 seg", i: "30 seg", a: "40 seg" },
        beneficios: ["Mejora circulación", "Activa piernas", "Calienta el cuerpo"]
    },

    talones_adulto: {
        titulo: "Elevación de talones",
        video: "/videos/adultos/talones.mp4",
        instrucciones: ["Eleva talones", "Controla la bajada"],
        tiempos: { p: "15 seg", i: "25 seg", a: "35 seg" },
        beneficios: ["Fortalece tobillos", "Mejora equilibrio"]
    }
};

const params = new URLSearchParams(window.location.search);
const eje = params.get("ejercicio");
const d = infoAdultos[eje];

document.getElementById("titulo-ejercicio").textContent = d.titulo;
document.getElementById("video-ejercicio").src = d.video;

d.instrucciones.forEach(i=>{
    const li=document.createElement("li");
    li.textContent=i;
    document.getElementById("lista-instrucciones").appendChild(li);
});

document.getElementById("tiempo-principiante").textContent = d.tiempos.p;
document.getElementById("tiempo-intermedio").textContent = d.tiempos.i;
document.getElementById("tiempo-avanzado").textContent = d.tiempos.a;

d.beneficios.forEach(b=>{
    const li=document.createElement("li");
    li.textContent=b;
    document.getElementById("beneficios").appendChild(li);
});

document.getElementById("btnIniciar").onclick = () => {
    window.location.href = `/pages/ejecucion_adultos.html?ejercicio=${eje}`;
};
