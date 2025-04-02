document.addEventListener("DOMContentLoaded", function () {

    // Add this helper function at the top
    function formatScore(value) {
        const num = parseFloat(value);
        return isNaN(num) ? "-" : num.toFixed(2);
    }

    fetch('assets/data/esg_scored_result.csv')
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const tableBody = document.getElementById("esgTableBody");
                    const companySelect = document.getElementById("companySelect");

                    const seenCompanies = new Set();

                    results.data.forEach(row => {
                        const tr = document.createElement("tr");

                        tr.innerHTML = `
                            <td>${row.Company}</td>
                            <td>${formatScore(row.E_score)}</td>
                            <td>${formatScore(row.S_score)}</td>
                            <td>${formatScore(row.G_score)}</td>
                            <td>${formatScore(row.ESG_score)}</td>
                            <td>${row["Grade"] || "-"}</td>
                        `;

                        tableBody.appendChild(tr);

                        if (!seenCompanies.has(row.Company)) {
                            const option = document.createElement("option");
                            option.value = row.Company;
                            option.textContent = row.Company;
                            companySelect.appendChild(option);
                            seenCompanies.add(row.Company);
                        }
                    });

                    new TomSelect("#companySelect", {
                        create: false,
                        sortField: {
                            field: "text",
                            direction: "asc"
                        },
                        placeholder: "Search ESG companies..."
                    });
                }
            });
        });
});
