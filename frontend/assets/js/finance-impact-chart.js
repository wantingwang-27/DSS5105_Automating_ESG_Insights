const companyData = [
    { name: "LG Energy Solution Ltd.", esg: 48.53, returns: 0.195, beta: 1.04, de_ratio: 0.95, max_drawdown: -0.48, altman: 2.24, alr: 0.49 },
    { name: "ENN Energy Holdings Limited", esg: 51.20, returns: 0.115, beta: 0.76, de_ratio: 1.14, max_drawdown: -0.73, altman: 2.47, alr: 0.53 },
    { name: "NRG Energy, Inc.", esg: 52.88, returns: 0.812, beta: 1.12, de_ratio: 8.69, max_drawdown: -0.91, altman: 2.06, alr: 0.90 },
    { name: "Nofar Energy Ltd.", esg: 61.02, returns: -0.087, beta: 0.49, de_ratio: 1.45, max_drawdown: -0.34, altman: 0.56, alr: 0.59 },
    { name: "New Fortress Energy Inc. (NFE)", esg: 47.35, returns: -0.592, beta: 1.56, de_ratio: 5.16, max_drawdown: -0.87, altman: 0.35, alr: 0.84 }
];

const ctx = document.getElementById('esgScatterChart').getContext('2d');
let scatterChart = null;

function renderChart(metricKey, label) {
    // Actual data points
    const scatterData = companyData.map(company => ({
        x: company.esg,
        y: company[metricKey],
        label: company.name
    }));

    // Prepare data for regression
    const regressionPoints = scatterData.map(d => [d.x, d.y]);
    const result = regression.linear(regressionPoints);

    // Generate full-width line using regression formula
    const xMin = Math.min(...scatterData.map(d => d.x));
    const xMax = Math.max(...scatterData.map(d => d.x));
    const regressionLine = [
        { x: xMin, y: result.predict(xMin)[1] },
        { x: xMax, y: result.predict(xMax)[1] }
    ];

    const config = {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: `ESG Score vs ${label}`,
                    data: scatterData,
                    backgroundColor: 'rgba(30, 58, 138, 0.7)',
                },
                {
                    label: 'Regression Line',
                    data: regressionLine,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    borderDash: [5, 5],
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const d = context.raw;
                            return d.label
                                ? `${d.label}: ESG ${d.x.toFixed(2)}, ${label} ${d.y.toFixed(2)}`
                                : null;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Correlation: ESG Score vs ${label}`
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'ESG Score' }
                },
                y: {
                    title: { display: true, text: label }
                }
            }
        }
    };

    if (scatterChart) scatterChart.destroy();
    scatterChart = new Chart(ctx, config);
}

document.getElementById('metricSelect').addEventListener('change', (e) => {
    const metricMap = {
        returns: '1 Yr Total Returns (%)',
        beta: 'Beta',
        de_ratio: 'D/E Ratio',
        max_drawdown: 'Maximum Drawdown',
        altman: 'Altman Z-Score',
        alr: 'Asset Liability Ratio'
    };
    renderChart(e.target.value, metricMap[e.target.value]);
});

// Initial chart render
renderChart('returns', '1 Yr Total Returns (%)');
