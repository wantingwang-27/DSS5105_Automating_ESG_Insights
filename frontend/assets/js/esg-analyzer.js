export function analyzeESGText(text, callback) {
    let env = 0, soc = 0, gov = 0;

    const environmentKeywords = [
        "net zero", "co2 avoided", "renewable electricity", "battery storage",
        "sustainability", "energy transition", "carbon footprint", "clean power",
        "climate", "emissions", "greenhouse gas"
    ];

    const socialKeywords = [
        "diversity", "equity", "inclusion", "community", "human rights",
        "health & safety", "fair cobalt", "volunteering", "employee", "training",
        "gender", "donation", "education", "social impact"
    ];

    const governanceKeywords = [
        "governance", "board", "risk management", "compliance", "transparency",
        "cybersecurity", "TCFD", "SFDR", "PRI", "audit", "code of conduct",
        "whistleblowing", "ethical", "regulation"
    ];

    // 🔍 Count keyword matches
    environmentKeywords.forEach(word => {
        if (text.toLowerCase().includes(word)) env++;
    });

    socialKeywords.forEach(word => {
        if (text.toLowerCase().includes(word)) soc++;
    });

    governanceKeywords.forEach(word => {
        if (text.toLowerCase().includes(word)) gov++;
    });

    // 🔧 Normalize scores to 100 based on maximum keyword "weight"
    const normalize = (count, maxHits = 12) => Math.min(100, Math.round((count / maxHits) * 100));
    const eScore = normalize(env);
    const sScore = normalize(soc);
    const gScore = normalize(gov);
    const overall = Math.round((eScore + sScore + gScore) / 3);

    // 🧠 Try to extract company/fund name from the first part of the text
    const company = extractCompanyName(text);

    // 🪵 Debugging output
    console.log("Matched ENV terms:", env);
    console.log("Matched SOC terms:", soc);
    console.log("Matched GOV terms:", gov);
    console.log("🏢 Company Inferred:", company);

    callback({
        company: company,
        environmental: eScore,
        social: sScore,
        governance: gScore,
        overall: overall
    });
}

// 🧠 Helper to infer company name from the report
function extractCompanyName(text) {
    const top = text.split('\n').slice(0, 30).join(' ');
    const clean = text.replace(/\s+/g, ' ');

    // 1. Direct match for Gore Street (or similar known structure)
    const knownMatch = clean.match(/\b(Gore Street Energy Storage Fund(?: plc)?)\b/i);
    if (knownMatch) return knownMatch[1].trim();

    // 2. Labeled fields: "Company: XYZ Ltd"
    const labelMatch = clean.match(/(?:Company|Fund|Entity|Organization|Issuer)\s*[:\-–]\s*([A-Z][A-Za-z0-9&,\s\-]{3,80})/i);
    if (labelMatch) return cleanupCompanyName(labelMatch[1]);

    // 3. "Prepared by" or "Published by" formats
    const prepMatch = clean.match(/(?:Prepared|Published|Issued|Presented)\s+by\s+([A-Z][A-Za-z0-9&,\s\-]{3,80})/i);
    if (prepMatch) return cleanupCompanyName(prepMatch[1]);

    // 4. Detect name in full caps from top of doc
    const capsMatch = top.match(/\b([A-Z][A-Z\s&]{5,})\b/);
    if (capsMatch) return toTitleCase(capsMatch[1]);

    // 5. Fallback: first title-like phrase
    const fallback = top.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    return fallback ? fallback[1].trim() : "Unnamed Entity";
}

// Helper: converts ALL CAPS → Title Case
function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Helper: removes trailing junk like "for the year ended..." or full sentences
function cleanupCompanyName(raw) {
    return raw.split(/[,:\.\n\-–]|(?=for the year|as of|report)/i)[0].trim();
}


