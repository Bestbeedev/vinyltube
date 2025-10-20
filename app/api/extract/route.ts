export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL YouTube requise" }, { status: 400 });
    }

    console.log('🔍 Extraction pour:', url);

    // Extraire l'ID vidéo
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\n]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    // Obtenir les infos via l'API YouTube oEmbed (fiable)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedResponse = await fetch(oembedUrl);

    let title = 'Video YouTube';
    let author = 'YouTube';
    let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      title = oembedData.title;
      author = oembedData.author_name;
      thumbnail = oembedData.thumbnail_url;
    }

    // Formats garantis (toujours disponibles via notre système)
    const formats = [
      {
        itag: 'mp4_720',
        quality: 'MP4 720p',
        container: 'mp4',
        hasAudio: true,
        hasVideo: true,
        fileSize: '20-80 MB',
        type: 'video'
      },
      {
        itag: 'mp4_480',
        quality: 'MP4 480p',
        container: 'mp4',
        hasAudio: true,
        hasVideo: true,
        fileSize: '10-50 MB',
        type: 'video'
      },
      {
        itag: 'mp3_128',
        quality: 'MP3 128kbps',
        container: 'mp3',
        hasAudio: true,
        hasVideo: false,
        fileSize: '3-10 MB',
        type: 'audio'
      }
    ];

    const response = {
      title,
      thumbnail,
      author,
      duration: 0,
      formats,
      videoId,
      url
    };

    console.log(`📦 Formats préparés pour: "${title}"`);

    return NextResponse.json(response);

  } catch (err: any) {
    console.error('❌ Erreur extraction:', err);
    return NextResponse.json(
      { error: "Impossible d'analyser cette vidéo" },
      { status: 400 }
    );
  }
}
