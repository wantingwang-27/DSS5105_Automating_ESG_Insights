document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("companySelect");
    const resetBtn = document.getElementById("resetFilterBtn");

    function filterTable(query) {
        const rows = document.querySelectorAll("#esgTableBody tr");
        const normalizedQuery = query.toLowerCase().trim();

        rows.forEach(row => {
            const companyName = row.querySelector("td")?.textContent?.toLowerCase() || "";
            if (!normalizedQuery || companyName.includes(normalizedQuery)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    select.addEventListener("input", function () {
        // Enables filtering even as user types
        filterTable(this.value);
    });

    select.addEventListener("change", function () {
        filterTable(this.value);
    });

    resetBtn.addEventListener("click", function () {
        select.tomselect.clear(); // Reset dropdown
        filterTable(""); // Show all rows
    });
});
