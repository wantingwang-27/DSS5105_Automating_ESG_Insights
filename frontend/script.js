// DOM READY
document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle functionality
    const toggleButton = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarTitle = sidebar?.querySelector("h2");

    if (toggleButton && sidebar && sidebarTitle) {
        toggleButton.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");

            if (sidebar.classList.contains("collapsed")) {
                toggleButton.style.left = "10.5px"; // Move button inside
                sidebarTitle.style.opacity = "0";    // Hide text
            } else {
                toggleButton.style.left = "100px";   // Reset button
                sidebarTitle.style.opacity = "1";    // Show text
            }
        });
    }

    // Call chart renderer if on trends.html
    renderESGTrendChart();
});

// ESG TRENDS CHART FUNCTION (Only runs if the canvas is found)
function renderESGTrendChart() {
    const chartCanvas = document.getElementById("esgTrendChart");
    const companySelect = document.getElementById("companySelect");
    const updateChartBtn = document.getElementById("updateChart");

    // Only run if all elements are found (on trends.html)
    if (!chartCanvas || !companySelect || !updateChartBtn) return;

    const ctx = chartCanvas.getContext("2d");

    // ESG fake data
    const esgData = {
        "Ørsted A/S": [70, 75, 78, 80, 82, 85],
        "Siemens Energy AG": [65, 68, 72, 74, 78, 80],
        "Peabody Energy Corporation": [55, 60, 65, 67, 70, 72],
        "Cheniere Energy, Inc.": [60, 63, 66, 69, 71, 74],
        "Harbour Energy plc": [50, 53, 57, 61, 65, 68]
    };

    const years = [2018, 2019, 2020, 2021, 2022, 2023];

    // 1. Populate the <select> options
    Object.keys(esgData).forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    });

    // 2. Create the chart with no datasets initially
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "black",
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: "ESG Score Trends (2018–2023)",
                    color: "#000000",
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#000000" },
                    grid: { color: "rgba(0,0,0,0.1)" }
                },
                y: {
                    ticks: { color: "#000000" },
                    grid: { color: "rgba(0,0,0,0.1)" }
                }
            }
        }
    });

    // 3. Update chart based on selected companies
    function updateChart(companies) {
        const colors = ["blue", "green", "orange", "red", "purple"];
        chart.data.datasets = companies.map((company, index) => ({
            label: company,
            data: esgData[company],
            borderColor: colors[index % colors.length],
            backgroundColor: "transparent",
            fill: false
        }));
        chart.update();
    }

    // 4. On button click, update chart with selected companies
    updateChartBtn.addEventListener("click", () => {
        const selected = Array.from(companySelect.selectedOptions).map(opt => opt.value);
        updateChart(selected);
    });

    // 5. Load default view (first company)
    updateChart(["Ørsted A/S"]);
}

