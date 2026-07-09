export const runtime = "nodejs";

import { BACKEND_CONFIG } from "@/config/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;

  const backendUrl = `${BACKEND_CONFIG.BASE_URL}/api/download/progress/${job_id}`;

  const backendRes = await fetch(backendUrl, {
    headers: { Accept: "text/event-stream" },
  });

  if (!backendRes.ok || !backendRes.body) {
    return new Response(JSON.stringify({ error: "Job introuvable" }), { status: 404 });
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
