import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug.join('/');
  
  // Retourner une SVG placeholder selon le slug
  const svgPlaceholder = `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
        ${slug.charAt(0).toUpperCase() + slug.slice(1)}
      </text>
    </svg>
  `;

  return new NextResponse(svgPlaceholder, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
