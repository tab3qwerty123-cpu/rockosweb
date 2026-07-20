// Vercel Serverless API Route: Download Counter & Redirector
// Endpoint: /api/download?target=turbo_amd64

const DOWNLOAD_LINKS = {
  amd64: process.env.DRIVE_AMD64 || "https://drive.google.com/uc?export=download&id=1S5uDkYMIZ9sbo6XbPkaaAWAAToSmMHqS",
  arm64: process.env.DRIVE_ARM64 || "https://drive.google.com/uc?export=download&id=1_zgDGZuDH_RRc556Eu0OIUA7BIYg3499",
  turbo_amd64: process.env.DRIVE_TURBO_AMD64 || "https://drive.google.com/uc?export=download&id=1S5uDkYMIZ9sbo6XbPkaaAWAAToSmMHqS",
  turbo_arm64: process.env.DRIVE_TURBO_ARM64 || "https://drive.google.com/uc?export=download&id=1_zgDGZuDH_RRc556Eu0OIUA7BIYg3499"
};

// Global memory counter store (Vercel KV or Upstash compatible)
global.downloadStats = global.downloadStats || {
  amd64: 0,
  arm64: 0,
  turbo_amd64: 0,
  turbo_arm64: 0,
  total: 0
};

export default function handler(req, res) {
  const { target = "amd64" } = req.query;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // Detect bots and search engine crawlers
  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bytespider|ahrefs|semrush|python|curl|wget/i.test(userAgent);

  // Only count real human browser downloads
  if (!isBot) {
    if (global.downloadStats[target] !== undefined) {
      global.downloadStats[target]++;
    } else {
      global.downloadStats[target] = 1;
    }
    global.downloadStats.total++;
  }

  // Get destination link
  const redirectUrl = DOWNLOAD_LINKS[target] || DOWNLOAD_LINKS.amd64;

  // Set CORS & Redirect
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.redirect(302, redirectUrl);
}
