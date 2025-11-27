const infoRehab = {
    hombro_banda: {
        titulo: "Movilidad de hombro con banda",
        video: "/videos/rehab/hombro_banda.mp4",
        instrucciones: [
            "Toma banda con ambas manos",
            "Eleva lentamente",
            "Controla el movimiento"
        ],
        tiempos: { p: "10 seg", i: "20 seg", a: "30 seg" },
        beneficios: ["Mejora movilidad", "Reduce dolor", "Fortalece hombro"]
    }
};

const q = new URLSearchParams(window.location.search);
const ej = q.get("ejercicio");
const d2 = infoRehab[ej];

document.getElementById("titulo-ejercicio").textContent = d2.titulo;
document.getElementById("video-ejercicio").src = d2.video;

d2.instrucciones.forEach(i=>{
    const li=document.createElement("li");
    li.textContent=i;
    document.getElementById("lista-instrucciones").appendChild(li);
});

document.getElementById("tiempo-principiante").textContent = d2.tiempos.p;
document.getElementById("tiempo-intermedio").textContent = d2.tiempos.i;
document.getElementById("tiempo-avanzado").textContent = d2.tiempos.a;

d2.beneficios.forEach(b=>{
    const li=document.createElement("li");
    li.textContent=b;
    document.getElementById("beneficios").appendChild(li);
});

document.getElementById("btnIniciar").onclick = () => {
    window.location.href = `/pages/ejecucion_rehabilitacion.html?ejercicio=${ej}`;
};
