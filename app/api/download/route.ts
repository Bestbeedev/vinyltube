export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBackendUrl, BACKEND_CONFIG } from "@/config/backend";

export async function POST(req: Request) {
  try {
    const { url, itag, format = "video" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    console.log('🎯 Préparation téléchargement pour:', url);

    // Valider l'URL YouTube
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\n]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    // Appeler le backend Python pour le téléchargement
    try {
      const backendResponse = await fetch(getBackendUrl('DOWNLOAD'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          itag,
          format
        }),
        // Timeout plus long pour le téléchargement (5 minutes)
        signal: AbortSignal.timeout(BACKEND_CONFIG.TIMEOUT)
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      
      console.log(`✅ Téléchargement backend prêt: "${data.filename}"`);

      // Si le backend retourne une URL de téléchargement direct
      if (data.downloadUrl) {
        return NextResponse.json({
          success: true,
          downloadUrl: data.downloadUrl,
          filename: data.filename,
          fileSize: data.fileSize,
          duration: data.duration,
          message: "Fichier prêt pour le téléchargement",
          backend: true
        });
      }

      // Si le backend sert directement le fichier
      if (data.fileUrl) {
        return NextResponse.json({
          success: true,
          fileUrl: data.fileUrl,
          filename: data.filename,
          fileSize: data.fileSize,
          message: "Fichier disponible",
          backend: true
        });
      }

      throw new Error("Réponse backend invalide");

    } catch (backendError) {
      console.error('❌ Erreur backend Python:', backendError);
      
      // Plus de fallback - on dépend uniquement du backend
      const errorMessage = backendError instanceof Error ? backendError.message : "Backend indisponible";
      return NextResponse.json(
        { error: "Le backend de traitement vidéo n'est pas disponible. Veuillez réessayer plus tard." },
        { status: 503 }
      );
    }

  } catch (err: any) {
    console.error("❌ Erreur préparation:", err);
    return NextResponse.json(
      { error: err.message || "Service temporairement indisponible" },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier l'état du backend
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkBackend = searchParams.get('check');

    if (checkBackend === 'true') {
      // Vérifier si le backend Python est accessible
      try {
        const healthResponse = await fetch(getBackendUrl('HEALTH'), {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          return NextResponse.json({
            backend: true,
            status: 'healthy',
            ...healthData
          });
        }
      } catch (error) {
        return NextResponse.json({
          backend: false,
          status: 'unreachable',
          error: 'Backend Python non accessible'
        });
      }
    }

    return NextResponse.json({
      message: "API download opérationnelle",
      backend_url: getBackendUrl('DOWNLOAD')
    });

  } catch (err: any) {
    console.error("❌ Erreur GET:", err);
    return NextResponse.json(
      { error: "Service indisponible" },
      { status: 500 }
    );
  }
}
