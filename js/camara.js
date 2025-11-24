const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
})
.catch(err => {
    alert("No se pudo acceder a la cámara");
});

function pausar() {
    video.pause();
}

function detener() {
    video.srcObject.getTracks().forEach(t => t.stop());
    alert("Sesión finalizada");
}
