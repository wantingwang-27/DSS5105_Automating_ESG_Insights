// main.js
document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle functionality
    const toggleButton = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarTitle = sidebar?.querySelector("h2");

    if (toggleButton && sidebar && sidebarTitle) {
        toggleButton.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");

            if (sidebar.classList.contains("collapsed")) {
                toggleButton.style.left = "24.5px";
                sidebarTitle.style.opacity = "0";
            } else {
                toggleButton.style.left = "100px";
                sidebarTitle.style.opacity = "1";
            }
        });
    }

    // Call ESG chart setup only if it's on the correct page
    if (typeof renderESGTrendChart === "function") {
        renderESGTrendChart();
    }
});
