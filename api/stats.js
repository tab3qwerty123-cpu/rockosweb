/**
 * Vercel Serverless Function: ROCKos Live Download Statistics API
 * Endpoint: /api/stats
 */

export default function handler(req, res) {
    // Statik sayaç değerleri ve simüle edilmiş canlı Vercel API yanıtı
    const stats = {
        status: "success",
        timestamp: new Date().toISOString(),
        downloads: {
            x64: 142,
            arm64: 98,
            turbo_x64: 89,
            turbo_arm64: 75,
            total: 404
        }
    };

    // CORS başlıkları ekle
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

    res.status(200).json(stats);
}
