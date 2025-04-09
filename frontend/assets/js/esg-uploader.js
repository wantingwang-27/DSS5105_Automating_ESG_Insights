const API_BASE = 'http://localhost:3001';
const MODEL_API = 'http://localhost:5050';

// PDF.js setup
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    console.log("✅ PDF.js workerSrc set successfully");
} else {
    console.error("❌ pdfjsLib not found. Make sure pdf.min.js is loaded before this script.");
}

let esgComparisonChart;
const chartLabels = [];
const extractedScores = [];
const predictedScores = [];

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    setupPDFUpload();
    loadESGFromServer();
    setupResetButton();
});

function setupPDFUpload() {
    const button = document.getElementById('analyzePDFBtn');
    const input = document.getElementById('pdfUpload');
    if (!button || !input) return;

    button.addEventListener('click', async () => {
        const file = input.files[0];
        if (!file) return showToast("⚠️ Please upload a PDF first.");

        showToast("⏳ Reading PDF...");
        const text = await extractPDFText(file);
        const company = extractCompanyName(text);
        // const scores = analyzeESGText(text);

        let gptData;
        try {
            const res = await fetch(`${MODEL_API}/gpt_esg_score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            gptData = await res.json();
            displayGPTESGInsights(gptData);
            console.log("🧠 GPT Response:", gptData);
        } catch (err) {
            console.error("❌ GPT scoring failed:", err);
            showToast("⚠️ GPT ESG insight unavailable.");
            return; // stop here if GPT fails
        }

        // ✅ use GPT values for table and backend
        const scores = {
            e: gptData?.Environmental?.score || 0,
            s: gptData?.Social?.score || 0,
            g: gptData?.Governance?.score || 0,
            overall: gptData?.Overall || 0
        };
        // ✅ Recalculate overall ESG from E/S/G
        scores.extracted = (scores.e + scores.s + scores.g) / 3;
        scores.predicted = scores.extracted; // model can override this below
        scores.grade = getESGGrade(scores.extracted);



        const predictedOverall = await getPredictedESGScore({
            emissions: scores.e,
            carbon: scores.e,
            diversity: scores.s,
            board: scores.g,
            governance: scores.g
        });

        const extracted = scores.overall;
        scores.extracted = extracted;
        scores.predicted = predictedOverall;
        scores.overall = predictedOverall;
        scores.grade = getESGGrade(predictedOverall);

        try {
            const res = await fetch(`${API_BASE}/api/esg`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company,
                    e: scores.e,
                    s: scores.s,
                    g: scores.g,
                    overall: predictedOverall,
                    extracted: scores.extracted,
                    predicted: scores.predicted,
                    grade: scores.grade,
                    gpt_environmental_insight: gptData?.Environmental?.insight || null,
                    gpt_social_insight: gptData?.Social?.insight || null,
                    gpt_governance_insight: gptData?.Governance?.insight || null,
                    gpt_overall_score: gptData?.Overall || null
                })
            });

            const data = await res.json();
            scores.id = data.id;
            insertTableRow({ id: data.id, company, ...scores });

            chartLabels.push(company);
            extractedScores.push(extracted);
            predictedScores.push(predictedOverall);
            updateESGComparisonChart();

            showToast("✅ ESG report uploaded and saved!");
        } catch (error) {
            console.error(error);
            showToast("❌ Failed to save ESG report.");
        }
    });
}

async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(' ') + '\n';
    }

    console.log("📄 Extracted Text (500 chars):", fullText.slice(0, 500));
    return fullText;
}

function extractCompanyName(text) {
    const patterns = [
        /Gore Street Energy Storage Fund plc/gi,
        /(?:Company[:\-]\s*)([A-Z][\w\s,&]{4,})/,
        /(?:Prepared by|Issued by|Published by)\s+([A-Z][\w\s,&]+)/i,
        /([A-Z][A-Z\s]{8,})/
    ];

    for (let regex of patterns) {
        const match = text.match(regex);
        if (match) return match[1] || match[0];
    }

    return "Inferred Company";
}

function analyzeESGText(text) {
    const keywords = {
        e: ["emissions", "renewable", "carbon", "climate", "net zero", "sustainability", "greenhouse"],
        s: ["diversity", "inclusion", "community", "employee", "human rights", "volunteer", "education"],
        g: ["governance", "board", "transparency", "compliance", "ethics", "audit", "risk"]
    };

    const lower = text.toLowerCase();
    const count = { e: 0, s: 0, g: 0 };

    for (const k in keywords) {
        keywords[k].forEach(word => {
            if (lower.includes(word)) count[k]++;
        });
    }

    const normalize = val => Math.min(100, Math.round((val / 10) * 100));
    const e = normalize(count.e);
    const s = normalize(count.s);
    const g = normalize(count.g);
    const overall = Math.round((e + s + g) / 3);
    const grade = getESGGrade(overall);

    if (e + s + g === 0) {
        showToast("⚠️ No ESG signals detected.");
        console.warn("No ESG keywords matched.");
    }

    return { e, s, g, overall, grade };
}

function getESGGrade(score) {
    if (score >= 80) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    return "D";
}

async function getPredictedESGScore(keywords) {
    try {
        const res = await fetch(`${MODEL_API}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(keywords)
        });

        const data = await res.json();
        return data.predicted_overall;
    } catch (err) {
        console.error("❌ Prediction failed:", err);
        return 0;
    }
}

function insertTableRow({ id, company, e, s, g, extracted }) {
    const tbody = document.getElementById("esgReportBody");
    const row = document.createElement('tr');
    if (id) row.dataset.id = id;

    const grade = getESGGrade(extracted);

    const nameCell = document.createElement('td');
    nameCell.innerText = company;
    nameCell.contentEditable = true;
    nameCell.title = "Click to edit company name";
    nameCell.addEventListener('blur', async () => {
        const newName = nameCell.innerText.trim();
        if (!newName || !id) return;
        try {
            const res = await fetch(`${API_BASE}/api/esg/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company: newName })
            });
            if (!res.ok) throw new Error();
            showToast("✅ Company name updated.");
        } catch {
            showToast("❌ Failed to update company.");
        }
    });
    row.appendChild(nameCell);

    [e, s, g, extracted.toFixed(2), grade].forEach(val => {
        const cell = document.createElement('td');
        cell.textContent = val;
        row.appendChild(cell);
    });

    tbody.appendChild(row);
}


// function insertTableRow({ id, company, e, s, g, extracted, predicted, grade }) {
//     const tbody = document.getElementById("esgReportBody");
//     const row = document.createElement('tr');
//     if (id) row.dataset.id = id;

//     const nameCell = document.createElement('td');
//     nameCell.innerText = company;
//     nameCell.contentEditable = true;
//     nameCell.title = "Click to edit company name";
//     nameCell.addEventListener('blur', async () => {
//         const newName = nameCell.innerText.trim();
//         if (!newName || !id) return;
//         try {
//             const res = await fetch(`${API_BASE}/api/esg/${id}`, {
//                 method: "PATCH",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ company: newName })
//             });
//             if (!res.ok) throw new Error();
//             showToast("✅ Company name updated.");
//         } catch {
//             showToast("❌ Failed to update company.");
//         }
//     });
//     row.appendChild(nameCell);

//     // Inject the ESG values into columns
//     [e, s, g, extracted.toFixed(2), grade].forEach(val => {
//         const cell = document.createElement('td');
//         cell.textContent = val;
//         row.appendChild(cell);
//     });

//     tbody.appendChild(row);
// }

function loadESGFromServer() {
    fetch(`${API_BASE}/api/esg`)
        .then(res => res.json())
        .then(data => {
            data.forEach(row => {
                row.extracted = row.extracted ?? row.overall;
                row.predicted = row.predicted ?? row.overall;
                insertTableRow(row);
                chartLabels.push(row.company);
                extractedScores.push(row.extracted);
                predictedScores.push(row.predicted);
            });
            updateESGComparisonChart();
        })
        .catch(err => console.error("❌ Load error:", err));
}

function updateESGComparisonChart() {
    const ctx = document.getElementById('esgComparisonChart').getContext('2d');
    if (esgComparisonChart) esgComparisonChart.destroy();

    esgComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                { label: 'Extracted ESG', data: extractedScores, backgroundColor: 'rgba(100, 100, 255, 0.7)' },
                { label: 'Predicted ESG', data: predictedScores, backgroundColor: 'rgba(255, 165, 0, 0.7)' }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'ESG Score' }
                }
            }
        }
    });
}

function setupResetButton() {
    const resetBtn = document.getElementById('resetESGBtn');
    if (!resetBtn) return;
    resetBtn.addEventListener('click', async () => {
        if (!confirm("⚠️ Are you sure you want to delete all ESG data?")) return;

        try {
            const res = await fetch(`${API_BASE}/api/esg`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Server error");
            await res.json();
            document.getElementById("esgReportBody").innerHTML = '';
            chartLabels.length = 0;
            extractedScores.length = 0;
            predictedScores.length = 0;
            updateESGComparisonChart();
            showToast("🧹 ESG data cleared!");
        } catch (err) {
            console.error("❌ Failed to reset data:", err);
            showToast("❌ Failed to reset ESG data.");
        }
    });
}

function displayGPTESGInsights(data) {
    const getBadgeClass = (score) => {
        if (score >= 80) return "badge success";
        if (score >= 60) return "badge warning";
        return "badge danger";
    };

    const container = document.getElementById("gptInsightCards");
    container.innerHTML = `
      <div class="gpt-card">
        <h3>🌿 Environmental 
          <span class="${getBadgeClass(data.Environmental.score)}">${data.Environmental.score}</span>
        </h3>
        <p>${data.Environmental.insight}</p>
      </div>
  
      <div class="gpt-card">
        <h3>🤝 Social 
          <span class="${getBadgeClass(data.Social.score)}">${data.Social.score}</span>
        </h3>
        <p>${data.Social.insight}</p>
      </div>
  
      <div class="gpt-card">
        <h3>🏛 Governance 
          <span class="${getBadgeClass(data.Governance.score)}">${data.Governance.score}</span>
        </h3>
        <p>${data.Governance.insight}</p>
      </div>
  
      <div class="gpt-card" style="flex-basis: 100%;">
        <h3>📊 Overall ESG Score 
          <span class="${getBadgeClass(data.Overall)}">${data.Overall}</span>
        </h3>
        <p>This is the AI-generated holistic ESG assessment based on the uploaded report.</p>
      </div>
    `;
}

