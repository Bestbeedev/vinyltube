import { NextResponse } from "next/server";

type HistoryItem = {
  title: string;
  format: string;
  date: string;
};

const historyStore: Record<string, HistoryItem[]> = {};

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  return NextResponse.json(historyStore[ip] || []);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { title, format } = await req.json();

  if (!title || !format) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  if (!historyStore[ip]) historyStore[ip] = [];
  historyStore[ip].unshift({
    title,
    format,
    date: new Date().toISOString(),
  });

  // Limite à 10 entrées max
  historyStore[ip] = historyStore[ip].slice(0, 10);

  return NextResponse.json({ message: "Historique mis à jour." });
}
