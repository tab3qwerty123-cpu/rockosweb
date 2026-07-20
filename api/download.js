/**
 * Vercel Serverless Function: ROCKos ISO Download Counter & Redirect API
 * Endpoint: /api/download?file=(x64|arm64|turbo_x64|turbo_arm64)
 */

// In-Memory & Persistent Download Counter Store
let downloadStats = {
    x64: 142,
    arm64: 98,
    turbo_x64: 89,
    turbo_arm64: 75
};

const DRIVE_LINKS = {
    x64: "https://drive.google.com/file/d/1S5uDkYMIZ9sbo6XbPkaaAWAAToSmMHqS/view?usp=sharing",
    arm64: "https://drive.google.com/file/d/1_zgDGZuDH_RRc556Eu0OIUA7BIYg3499/view?usp=sharing",
    turbo_x64: "https://drive.google.com/file/d/1BSq5fCGyd9PAO0jy5DqBIdsmZTdHaDVs/view?usp=drive_link",
    turbo_arm64: "https://drive.google.com/file/d/1e0n6xHX9R5UNwTZAvRtBue631SLbcpdF/view?usp=sharing"
};

export default function handler(req, res) {
    const { file } = req.query;
    const targetKey = file && DRIVE_LINKS[file] ? file : "x64";
    const targetUrl = DRIVE_LINKS[targetKey];

    // İndirme sayısını +1 artır
    if (downloadStats[targetKey] !== undefined) {
        downloadStats[targetKey] += 1;
    }

    // CORS & Cache kontrol başlıkları
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // Kullanıcıyı anında Google Drive ISO linkine yönlendir (HTTP 302 Redirect)
    res.redirect(302, targetUrl);
}
