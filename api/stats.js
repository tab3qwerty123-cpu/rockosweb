/**
 * Vercel Serverless Function: ROCKos Live Download Statistics API
 * Endpoint: /api/stats
 */

export default function handler(req, res) {
    const stats = {
        status: "success",
        timestamp: new Date().toISOString(),
        downloads: {
            x64: 0,
            arm64: 0,
            turbo_x64: 0,
            turbo_arm64: 0,
            total: 0
        }
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");

    res.status(200).json(stats);
}
