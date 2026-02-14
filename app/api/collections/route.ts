import { NextResponse } from "next/server";

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  totalSize: string;
  createdAt: string;
  isPublic: boolean;
  thumbnail?: string;
  tags: string[];
}

// Stockage temporaire en mémoire (à remplacer par une vraie DB)
let collections: Collection[] = [
  {
    id: '1',
    name: 'Musiques Chill',
    description: 'Playlist pour se détendre',
    itemCount: 24,
    totalSize: '156 MB',
    createdAt: '2025-01-15',
    isPublic: false,
    thumbnail: '/api/placeholder/music.jpg',
    tags: ['musique', 'relax', 'chill']
  },
  {
    id: '2', 
    name: 'Tutoriels Tech',
    description: 'Vidéos éducatives et tutoriels',
    itemCount: 18,
    totalSize: '892 MB',
    createdAt: '2025-01-10',
    isPublic: true,
    thumbnail: '/api/placeholder/tech.jpg',
    tags: ['éducation', 'tech', 'tutoriel']
  },
  {
    id: '3',
    name: 'Podcasts Favoris',
    description: 'Extraits audio de podcasts',
    itemCount: 32,
    totalSize: '234 MB',
    createdAt: '2025-01-08',
    isPublic: false,
    thumbnail: '/api/placeholder/podcast.jpg',
    tags: ['podcast', 'audio', 'conversation']
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: collections,
    total: collections.length
  });
}

export async function POST(req: Request) {
  try {
    const { name, description, tags } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ 
        error: "Le nom de la collection est requis" 
      }, { status: 400 });
    }

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description?.trim() || '',
      itemCount: 0,
      totalSize: '0 MB',
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: false,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
    };

    collections.unshift(newCollection);

    return NextResponse.json({
      success: true,
      data: newCollection,
      message: "Collection créée avec succès"
    });

  } catch (error) {
    console.error('Erreur création collection:', error);
    return NextResponse.json({
      error: "Erreur lors de la création de la collection"
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "ID de collection requis" 
      }, { status: 400 });
    }

    const initialLength = collections.length;
    collections = collections.filter(c => c.id !== id);

    if (collections.length === initialLength) {
      return NextResponse.json({ 
        error: "Collection non trouvée" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Collection supprimée avec succès"
    });

  } catch (error) {
    console.error('Erreur suppression collection:', error);
    return NextResponse.json({
      error: "Erreur lors de la suppression de la collection"
    }, { status: 500 });
  }
}
