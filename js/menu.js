const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("closeSidebar");
const overlay = document.getElementById("overlay");
const logoutBtn = document.getElementById("logoutBtn");

// Abrir menú
menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
});

// Cerrar menú
closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
});

// Cerrar al tocar afuera
overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
});

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../index.html";
});
