window.addEventListener("DOMContentLoaded", () => {
    if (!("webkitSpeechRecognition" in window)) return;

    const reco = new webkitSpeechRecognition();
    reco.lang = "es-MX";
    reco.continuous = true;

    reco.onresult = (event) => {
        const txt = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voz rehab:", txt);

        if (txt.includes("hombro_banda")) window.location.href = "/pages/demostracion.html?ejercicio=hombro_banda";
        if (txt.includes("pierna")) window.location.href = "/pages/demostracion.html?ejercicio=elevacion_pierna_rehab";
        if (txt.includes("caminata")) window.location.href = "/pages/demostracion.html?ejercicio=caminata_banda";
        if (txt.includes("rodilla")) window.location.href = "/pages/demostracion.html?ejercicio=rodilla_rehab";
        if (txt.includes("lumbar")) window.location.href = "/pages/demostracion.html?ejercicio=lumbar";
        if (txt.includes("tobillo")) window.location.href = "/pages/demostracion.html?ejercicio=tobillo_rehab";

        if (txt.includes("abrir menú")) document.getElementById("menuBtn").click();
        if (txt.includes("cerrar menú")) document.getElementById("closeSidebar").click();
        if (txt.includes("perfil")) window.location.href = "/pages/perfil.html";
        if (txt.includes("cerrar sesión")) document.getElementById("logoutBtn").click();
    };

    reco.start();
});
