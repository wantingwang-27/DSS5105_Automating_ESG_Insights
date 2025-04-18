document.addEventListener("DOMContentLoaded", function () {
    const reportBody = document.getElementById("esgReportBody");

    function formatScore(value) {
        const num = parseFloat(value);
        return isNaN(num) ? "-" : num.toFixed(2);
    }

    const gradeColors = {
        "A": "#2ECC71",
        "B": "#F39C12",
        "C": "#E74C3C",
        "UNKNOWN": "#95A5A6"
    };

    function gradeGroup(rawGrade) {
        if (!rawGrade) return "UNKNOWN";
        const grade = rawGrade.trim().toUpperCase();
        if (grade.startsWith("A")) return "A";
        if (grade.startsWith("B")) return "B";
        if (grade.startsWith("C")) return "C";
        return "UNKNOWN";
    }

    const legendContainer = document.createElement("div");
    legendContainer.style.marginTop = "20px";
    legendContainer.innerHTML = `
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            ${Object.entries(gradeColors).map(([label, color]) => `
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 16px; height: 16px; background-color: ${color}; border-radius: 4px;"></span>
                    <span style="font-size: 14px;">${label}</span>
                </div>
            `).join("")}
        </div>
    `;

    fetch("assets/data/esg_scored_result.csv")
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const data = results.data;

                    // Populate ESG table
                    data.forEach(row => {
                        const tr = document.createElement("tr");

                        const gradeTier = gradeGroup(row.Grade);
                        const gradeClass = `esg-grade-${gradeTier.toLowerCase()}`;
                        const gradeHTML = `<span class="${gradeClass}">${row.Grade || '-'}</span>`;

                        tr.innerHTML = `
                            <td>${row.Company}</td>
                            <td>${formatScore(row.E_score)}</td>
                            <td>${formatScore(row.S_score)}</td>
                            <td>${formatScore(row.G_score)}</td>
                            <td>${formatScore(row.ESG_score)}</td>
                            <td>${gradeHTML}</td>
                        `;
                        reportBody.appendChild(tr);
                    });

                    // ESG Distribution Chart
                    const topCompanies = data.slice(0, 6);
                    const labels = topCompanies.map(r => r.Company);
                    const scores = topCompanies.map(r => parseFloat(r.ESG_score));
                    const colors = topCompanies.map(r => {
                        const tier = gradeGroup(r.Grade);
                        return gradeColors[tier] || gradeColors["UNKNOWN"];
                    });

                    new Chart(document.getElementById('esgDistributionChart'), {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'ESG Score',
                                data: scores,
                                backgroundColor: colors,
                                borderRadius: 6
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Top ESG Scores by Company',
                                    font: { size: 18, weight: 'bold' },
                                    padding: { top: 10, bottom: 20 }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const grade = topCompanies[context.dataIndex].Grade || "-";
                                            return `Score: ${context.parsed.y} | Grade: ${grade}`;
                                        }
                                    }
                                },
                                legend: { display: false }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { stepSize: 10 }
                                },
                                x: {
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 45
                                    }
                                }
                            }
                        }
                    });

                    // Add legend
                    document.getElementById("esgLegendContainer").appendChild(legendContainer);

                    // Industry ESG Chart
                    const industries = {
                        "Renewable Energy": 5,
                        "Oil & Gas": 3,
                        "Tech": 4,
                        "Utilities": 2
                    };

                    new Chart(document.getElementById('industryComparisonChart'), {
                        type: 'pie',
                        data: {
                            labels: Object.keys(industries),
                            datasets: [{
                                data: Object.values(industries),
                                backgroundColor: ["#2ECC71", "#F39C12", "#1A73E8", "#E74C3C"]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Industry ESG Breakdown',
                                    font: { size: 18 },
                                    padding: { top: 10, bottom: 20 }
                                },
                                legend: {
                                    position: 'bottom',
                                    labels: { padding: 15 }
                                }
                            }
                        }
                    });
                }
            });
        });
});
