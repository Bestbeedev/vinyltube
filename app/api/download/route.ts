export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export async function POST(req: Request) {
  try {
    const { url, itag, format = "video" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const backendResponse = await fetch(getBackendUrl("DOWNLOAD"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, itag, format }),
      signal: AbortSignal.timeout(10000), // juste le temps de créer le job
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    // data = { job_id: "...", message: "..." }
    return NextResponse.json({ success: true, job_id: data.job_id });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Service temporairement indisponible";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("check") === "true") {
    try {
      const res = await fetch(getBackendUrl("HEALTH"), { signal: AbortSignal.timeout(5000) });
      if (res.ok) return NextResponse.json({ backend: true, status: "healthy" });
    } catch {
      return NextResponse.json({ backend: false, status: "unreachable" });
    }
  }
  return NextResponse.json({ message: "API download opérationnelle" });
}
