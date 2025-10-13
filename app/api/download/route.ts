export const runtime = "nodejs";

import { NextResponse } from "next/server";
import ytdl, { videoFormat } from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { PassThrough } from "stream";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

type DownloadRequest = { url: string; itag?: string; format?: string };

export async function POST(req: Request) {
  try {
    const { url, itag, format }: DownloadRequest = await req.json();

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    const info = await ytdl.getInfo(url);

    // Choisir le format
    let chosenVideo: videoFormat | undefined;
    if (itag) {
      chosenVideo = info.formats.find(f => f.itag.toString() === itag);
    } else if (format === "audio") {
      chosenVideo = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
    } else {
      // Choisir le meilleur format audio+vidéo
      chosenVideo = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
    }

    if (!chosenVideo) {
      return NextResponse.json({ error: "Format non disponible" }, { status: 400 });
    }

    const sanitizedTitle = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const fileName = `${sanitizedTitle || "video"}.${format === "audio" ? "mp3" : "mp4"}`;

    const videoStream = ytdl(url, { format: chosenVideo });
    const audioStream = format === "audio" ? videoStream : ytdl(url, { quality: "highestaudio" });

    const passthrough = new PassThrough();

    // Fusion si vidéo + audio séparés
    if (!chosenVideo.hasAudio && format !== "audio") {
      ffmpeg()
        .input(videoStream)
        .input(audioStream)
        .outputOptions("-c:v copy", "-c:a aac")
        .format("mp4")
        .pipe(passthrough);
    } else {
      videoStream.pipe(passthrough);
    }

    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    return new Response(passthrough, { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur téléchargement";
    console.error("Erreur /api/download:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
