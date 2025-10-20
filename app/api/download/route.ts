export const runtime = "nodejs";

import { NextResponse } from "next/server";

// Services stables qui fonctionnent réellement
const WORKING_SERVICES = {
  audio: [
    {
      name: "YTMP3",
      url: (videoUrl: string) => `https://ytmp3.cc/en13/#url=${encodeURIComponent(videoUrl)}`,
      description: "Conversion MP3 fiable"
    },
    {
      name: "Y2Mate MP3",
      url: (videoUrl: string) => `https://www.y2mate.com/youtube-mp3/${getVideoId(videoUrl)}`,
      description: "Service MP3 populaire"
    }
  ],
  video: [
    {
      name: "SaveFrom",
      url: (videoUrl: string) => `https://en.savefrom.net/1-youtube-video-downloader/?url=${encodeURIComponent(videoUrl)}`,
      description: "Téléchargement vidéo fiable"
    },
    {
      name: "Y2Mate MP4",
      url: (videoUrl: string) => `https://www.y2mate.com/youtube-mp4/${getVideoId(videoUrl)}`,
      description: "Service MP4 populaire"
    },
    {
      name: "YT5S",
      url: (videoUrl: string) => `https://yt5s.com/en32?url=${encodeURIComponent(videoUrl)}`,
      description: "Conversion rapide"
    }
  ]
};

// Fonction pour extraire l'ID vidéo
const getVideoId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\n]+)/);
  return match ? match[1] : '';
};

// Fonction pour obtenir les infos de la vidéo
const getVideoInfo = async (videoId: string) => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url
      };
    }
  } catch (error) {
    console.error('Erreur récupération infos:', error);
  }

  return {
    title: 'video',
    author: 'YouTube',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
};

export async function POST(req: Request) {
  try {
    const { url, itag, format = "video" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    console.log('🎯 Préparation téléchargement pour:', url);

    // Extraire l'ID vidéo
    const videoId = getVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    // Obtenir les infos de la vidéo
    const videoInfo = await getVideoInfo(videoId);

    // Sélectionner le service le plus fiable
    const services = WORKING_SERVICES[format as keyof typeof WORKING_SERVICES] || WORKING_SERVICES.video;
    const service = services[0]; // Toujours utiliser le premier service (le plus fiable)

    const downloadUrl = service.url(url);

    console.log(`✅ Service sélectionné: ${service.name}`);

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl,
      service: service.name,
      description: service.description,
      videoInfo: {
        title: videoInfo.title,
        author: videoInfo.author,
        thumbnail: videoInfo.thumbnail
      },
      message: "Prêt pour le téléchargement",
      videoId: videoId,
      quality: itag
    });

  } catch (err: any) {
    console.error("❌ Erreur préparation:", err);

    return NextResponse.json(
      { error: "Service temporairement indisponible" },
      { status: 500 }
    );
  }
}

// Route GET pour téléchargement direct via service externe
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const format = searchParams.get('format') || 'video';

    if (!url) {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    // Service par défaut ultra fiable
    let downloadUrl: string;

    if (format === "audio") {
      // YTMP3 - Très fiable pour l'audio
      downloadUrl = `https://ytmp3.cc/en13/#url=${encodeURIComponent(url)}`;
    } else {
      // SaveFrom - Très fiable pour la vidéo
      downloadUrl = `https://en.savefrom.net/1-youtube-video-downloader/?url=${encodeURIComponent(url)}`;
    }

    console.log('🎯 Redirection vers service fiable:', downloadUrl);
    return Response.redirect(downloadUrl);

  } catch (err: any) {
    console.error("❌ Erreur redirection:", err);

    // Fallback absolu
    const url = new URL(req.url).searchParams.get('url');
    if (url) {
      return Response.redirect(`https://en.savefrom.net/1-youtube-video-downloader/?url=${encodeURIComponent(url)}`);
    }

    return NextResponse.json({
      error: "Service indisponible"
    }, { status: 500 });
  }
}
