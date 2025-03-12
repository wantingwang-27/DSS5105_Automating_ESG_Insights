document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarTitle = sidebar.querySelector("h2"); // Selects "ESG Dashboard" text

    toggleButton.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed");

        // Move button properly and hide text when collapsed
        if (sidebar.classList.contains("collapsed")) {
            toggleButton.style.left = "10.5px"; // Move button inside sidebar
            sidebarTitle.style.opacity = "0"; // Hide the ESG Dashboard text
        } else {
            toggleButton.style.left = "100px"; // Reset button position
            sidebarTitle.style.opacity = "1"; // Show ESG Dashboard text
        }
    });
});
