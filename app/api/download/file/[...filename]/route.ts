export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename: filenameParts } = await params;
    const filename = filenameParts.join('/');
    
    if (!filename) {
      return NextResponse.json({ error: "Nom de fichier requis" }, { status: 400 });
    }

    console.log('📥 Proxy de téléchargement pour:', filename);

    // Construire l'URL du backend Python
    const backendFileUrl = `${getBackendUrl('DOWNLOAD')}/file/${filename}`;
    
    console.log('🔄 Redirection vers le backend:', backendFileUrl);

    // Proxy vers le backend Python
    const response = await fetch(backendFileUrl, {
      method: 'GET',
      headers: {
        // Transférer les headers pertinents
        'User-Agent': req.headers.get('user-agent') || '',
        'Range': req.headers.get('range') || '',
      },
    });

    if (!response.ok) {
      console.error('❌ Erreur backend:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur de téléchargement: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Retourner le fichier avec les headers appropriés
    const fileBuffer = await response.arrayBuffer();
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': response.headers.get('content-length') || '',
        'Content-Disposition': response.headers.get('content-disposition') || `attachment; filename="${filename}"`,
        'Accept-Ranges': response.headers.get('accept-ranges') || 'bytes',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('❌ Erreur proxy téléchargement:', error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
