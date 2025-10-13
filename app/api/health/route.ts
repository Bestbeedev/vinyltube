import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "VynilTube API opérationnelle 🚀",
    time: new Date().toISOString(),
  });
}
