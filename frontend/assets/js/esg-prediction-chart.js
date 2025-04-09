let esgChart;

function updateChartWithCompanies(companies) {

    console.log("Updating chart with companies:", companies);
    const data = window.esgRawData || [];
    const datasets = [];
    const colors = ["#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#e91e63"];

    companies.forEach((companyName, index) => {
        const row = data.find(r => r["Company"]?.trim() === companyName);
        if (!row) return;

        const companyData = [
            parseFloat(row["E_score"]),
            parseFloat(row["S_score"]),
            parseFloat(row["G_score"]),
            parseFloat(row["ESG_score"]),
            parseFloat(row["ESGC_score"])
        ];

        datasets.push({
            label: companyName,
            data: companyData,
            backgroundColor: colors[index % colors.length]
        });
    });

    esgChart.data.datasets = datasets;
    esgChart.update();
}

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("esgPredictionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    esgChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Environmental", "Social", "Governance", "Overall ESG", "Predicted ESGC"],
            datasets: []  // will be populated dynamically
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: "top" },
                tooltip: { mode: "index", intersect: false }
            },
            scales: {
                x: {
                    stacked: false  // ← allow grouped display
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    stacked: false
                }
            }
        }
    });

});
