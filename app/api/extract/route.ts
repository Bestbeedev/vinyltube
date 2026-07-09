export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export async function POST(req: Request) {
  try {
    const { url, fast = false } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const endpoint = fast ? "EXTRACT_FAST" : "EXTRACT";

    const backendResponse = await fetch(getBackendUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(fast ? 15000 : 30000),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || `Erreur backend: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Impossible d'analyser cette URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
