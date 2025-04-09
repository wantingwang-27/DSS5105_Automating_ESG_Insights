document.addEventListener("DOMContentLoaded", function () {

    // Global variable to store full ESG dataset
    window.esgRawData = [];

    // Helper: Format numbers or return "N/A"
    function formatScore(value) {
        const num = parseFloat(value);
        return isNaN(num) ? "N/A" : num.toFixed(2);
    }

    // Helper: Clean up column name spacing
    const clean = key => key?.trim();

    Papa.parse("assets/data/esg_final_with_controversy.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const data = results.data;
            window.esgRawData = data;

            const tbody = document.getElementById("esgTableBody");
            const companySelect = document.getElementById("companySelect");

            tbody.innerHTML = "";
            if (companySelect) {
                companySelect.innerHTML = '<option value="">Select from top ESG performers</option>';
            }

            const addedCompanies = new Set();

            data.forEach(row => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${row[clean("Company")] || "N/A"}</td>
                    <td>${formatScore(row[clean("E_score")])}</td>
                    <td>${formatScore(row[clean("S_score")])}</td>
                    <td>${formatScore(row[clean("G_score")])}</td>
                    <td>${formatScore(row[clean("ESG_score")])}</td>
                    <td>${row[clean("Grade")] || "N/A"}</td>
                    <td>${formatScore(row[clean("ESGC_score")])}</td>
                    <td>${row[clean("ESGC_Grade")] || "N/A"}</td>
                `;

                tbody.appendChild(tr);

                const companyName = row[clean("Company")];
                if (companySelect && companyName && !addedCompanies.has(companyName)) {
                    const option = document.createElement("option");
                    option.value = companyName;
                    option.textContent = companyName;
                    companySelect.appendChild(option);
                    addedCompanies.add(companyName);
                }
            });

            // Initialize TomSelect and hook into dropdown changes
            if (companySelect && typeof TomSelect !== "undefined") {
                const tom = new TomSelect("#companySelect", {
                    maxItems: 2,
                    create: false,
                    sortField: {
                        field: "text",
                        direction: "asc"
                    }
                });

                tom.on("change", function () {
                    const selectedCompanies = tom.getValue(); // array
                    if (typeof updateChartWithCompanies === "function") {
                        updateChartWithCompanies(selectedCompanies);
                    }
                    if (typeof updateTableWithCompanies === "function") {
                        updateTableWithCompanies(selectedCompanies);
                    }
                });
            }
        },
        error: function (err) {
            console.error("PapaParse error:", err);
        }
    });

    // 👇 NEW: Function to filter visible table rows based on selected companies
    function updateTableWithCompanies(companies) {
        const rows = document.querySelectorAll("#esgTableBody tr");

        rows.forEach(row => {
            const companyName = row.children[0]?.textContent?.trim();
            if (companies.includes(companyName)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
});
