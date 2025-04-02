document.addEventListener("DOMContentLoaded", function () {
    const companySelect = document.getElementById("companySelect");
    const updateChartBtn = document.getElementById("updateChart");
    const ctx = document.getElementById("esgTrendChart").getContext("2d");

    let esgChart;

    // Helper to generate fake ESG scores over time
    function generateFakeESGData(start = 2020, end = 2025) {
        const data = [];
        let base = Math.random() * 40 + 50; // Start between 50 and 90
        for (let year = start; year <= end; year++) {
            base += (Math.random() * 6 - 3); // fluctuate +-3
            data.push(Number(base.toFixed(2)));
        }
        return data;
    }

    // Load companies from CSV
    fetch("assets/data/esg_scored_result.csv")
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const uniqueCompanies = new Set();

                    results.data.forEach(row => {
                        if (row.Company && !uniqueCompanies.has(row.Company)) {
                            uniqueCompanies.add(row.Company);

                            const option = document.createElement("option");
                            option.value = row.Company;
                            option.textContent = row.Company;
                            companySelect.appendChild(option);
                        }
                    });
                }
            });
        });

    // Initialize Chart.js
    function initChart(labels, datasets) {
        if (esgChart) esgChart.destroy();
        esgChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'ESG Trend Data (2020–2025)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }
            }
        });
    }

    // Handle Chart Update
    updateChartBtn.addEventListener("click", function () {
        const selectedOptions = Array.from(companySelect.selectedOptions);
        if (!selectedOptions.length) return;

        const labels = ["2020", "2021", "2022", "2023", "2024", "2025"];
        const datasets = selectedOptions.map(option => {
            return {
                label: option.value,
                data: generateFakeESGData(),
                borderWidth: 2,
                fill: false,
                tension: 0.3
            };
        });

        initChart(labels, datasets);
    });
});
