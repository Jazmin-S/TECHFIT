window.addEventListener("DOMContentLoaded", () => {
    if (!("webkitSpeechRecognition" in window)) return;

    const reco = new webkitSpeechRecognition();
    reco.lang = "es-MX";
    reco.continuous = true;

    reco.onresult = (event) => {
        const txt = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voz adultos:", txt);

        if (txt.includes("marcha")) window.location.href = "/pages/demostracion.html?ejercicio=marcha";
        if (txt.includes("talones")) window.location.href = "/pages/demostracion.html?ejercicio=talones_adulto";
        if (txt.includes("sentarse")) window.location.href = "/pages/demostracion.html?ejercicio=sentarse";
        if (txt.includes("brazos")) window.location.href = "/pages/demostracion.html?ejercicio=brazos_adulto";
        if (txt.includes("hombros")) window.location.href = "/pages/demostracion.html?ejercicio=hombros_adulto";
        if (txt.includes("pierna")) window.location.href = "/pages/demostracion.html?ejercicio=pierna_adulto";

        if (txt.includes("abrir menú")) document.getElementById("menuBtn").click();
        if (txt.includes("cerrar menú")) document.getElementById("closeSidebar").click();
        if (txt.includes("perfil")) window.location.href = "/pages/perfil.html";
        if (txt.includes("cerrar sesión")) document.getElementById("logoutBtn").click();
    };

    reco.start();
});
