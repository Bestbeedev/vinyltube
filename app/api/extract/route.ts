export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export async function POST(req: Request) {
  try {
    const { url, fast = false } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL YouTube requise" }, { status: 400 });
    }

    console.log('🔍 Extraction pour:', url, fast ? '(mode rapide)' : '(mode complet)');

    // Valider l'URL YouTube - regex plus complète pour tous les formats YouTube
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&?\n]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: "URL YouTube invalide" }, { status: 400 });
    }

    // Choisir l'endpoint selon le mode
    const endpoint = fast ? 'EXTRACT_FAST' : 'EXTRACT';

    // Appeler le backend Python
    try {
      const backendResponse = await fetch(getBackendUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        // Timeout adapté selon le mode
        signal: AbortSignal.timeout(fast ? 15000 : 30000)
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      
      console.log(`✅ Informations extraites du backend (${fast ? 'rapide' : 'complet'}): "${data.title}"`);
      
      return NextResponse.json(data);

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
    console.error('❌ Erreur extraction:', err);
    return NextResponse.json(
      { error: err.message || "Impossible d'analyser cette vidéo" },
      { status: 500 }
    );
  }
}
