export const runtime = "nodejs";

import { NextResponse } from "next/server";
import ytdl from "ytdl-core";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
});

const applyRateLimit = async (req: Request) =>
    new Promise<void>((resolve, reject) => {
        limiter(req as any, {} as any, (err: any) => (err ? reject(err) : resolve()));
    });

export async function POST(req: Request) {
    try {
        //await applyRateLimit(req);

        const { url } = await req.json();
        if (!url || !ytdl.validateURL(url)) {
            return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
        }

        const info = await ytdl.getInfo(url);
        console.error('1-INFO', info)
        const formats = ytdl.filterFormats(info.formats, "audioandvideo");
        console.error('2-FORMATS', formats)
        return NextResponse.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop()?.url,
            author: info.videoDetails.author.name,
            duration: info.videoDetails.lengthSeconds,
            formats: formats.map(f => ({
                quality: f.qualityLabel,
                itag: f.itag,
                container: f.container,
                hasAudio: f.hasAudio,
                hasVideo: f.hasVideo,
            })),
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur extraction";
        console.error("Erreur /api/extract:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
