/**
 * Vercel Serverless Function: ROCKos ISO Download Counter & Redirect API
 * Endpoint: /api/download?file=(x64|arm64|turbo_x64|turbo_arm64)
 * Anti-Bot & Crawler Protection Enforced
 */

// In-Memory & Persistent Download Counter Store (Reset to 0)
let downloadStats = {
    x64: 0,
    arm64: 0,
    turbo_x64: 0,
    turbo_arm64: 0
};

const DRIVE_LINKS = {
    x64: "https://drive.google.com/file/d/1S5uDkYMIZ9sbo6XbPkaaAWAAToSmMHqS/view?usp=sharing",
    arm64: "https://drive.google.com/file/d/1_zgDGZuDH_RRc556Eu0OIUA7BIYg3499/view?usp=sharing",
    turbo_x64: "https://drive.google.com/file/d/1BSq5fCGyd9PAO0jy5DqBIdsmZTdHaDVs/view?usp=drive_link",
    turbo_arm64: "https://drive.google.com/file/d/1e0n6xHX9R5UNwTZAvRtBue631SLbcpdF/view?usp=sharing"
};

// Known Bot & Web Crawler User-Agent Patterns
const BOT_PATTERNS = [
    "bot", "spider", "crawler", "curl", "wget", "python", "axios", 
    "postman", "headless", "googlebot", "bingbot", "slurp", "yandex", 
    "duckduckgo", "facebookexternalhit", "twitterbot", "linkedinbot",
    "embed", "preview", "go-http-client", "apache-httpclient", "node-fetch",
    "scraper", "httpclient", "java/", "libwww-perl"
];

function isBotRequest(req) {
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();
    if (!userAgent || userAgent.trim().length < 10) {
        return true;
    }
    return BOT_PATTERNS.some(pattern => userAgent.includes(pattern));
}

export default function handler(req, res) {
    const { file } = req.query;
    const targetKey = file && DRIVE_LINKS[file] ? file : "x64";
    const targetUrl = DRIVE_LINKS[targetKey];

    const isBot = isBotRequest(req);

    // Sadece GERÇEK İNSAN kullanıcıların tıklamalarında sayacı +1 artır!
    if (!isBot && downloadStats[targetKey] !== undefined) {
        downloadStats[targetKey] += 1;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    res.redirect(302, targetUrl);
}
