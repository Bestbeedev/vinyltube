import ytdl from "ytdl-core";

export async function POST(req) {
  try {
    const { url, format } = await req.json();

    if (!ytdl.validateURL(url)) {
      return new Response(JSON.stringify({ error: "URL invalide" }), { status: 400 });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "_");

    const filter = format === "audio"
      ? "audioonly"
      : "videoandaudio";

    const itag = format === "720p"
      ? 22
      : format === "1080p"
      ? 137
      : 18;

    const stream = ytdl(url, { quality: itag, filter });

    const headers = {
      "Content-Disposition": `attachment; filename="${title}.mp4"`,
      "Content-Type": "video/mp4",
    };

    return new Response(stream, { headers });
  } catch (err) {
    console.error("Erreur:", err);
    return new Response(JSON.stringify({ error: "Erreur lors du téléchargement" }), { status: 500 });
  }
}
