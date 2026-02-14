# Backend Python - VinylTube

Ce dossier contiendra le backend Python pour VinylTube.

## Architecture attendue

Le backend Python devra exposer les endpoints suivants :

### API Endpoints

#### `POST /api/extract`
- **Description**: Extrait les informations d'une vidéo YouTube
- **Request**: `{ "url": "string" }`
- **Response**: 
```json
{
  "title": "string",
  "thumbnail": "string",
  "author": "string",
  "duration": number,
  "formats": [
    {
      "itag": "string",
      "quality": "string", 
      "container": "string",
      "hasAudio": boolean,
      "hasVideo": boolean,
      "fileSize": "string",
      "type": "video|audio"
    }
  ],
  "videoId": "string"
}
```

#### `POST /api/download`
- **Description**: Prépare et sert le téléchargement d'une vidéo
- **Request**: `{ "url": "string", "itag": "string", "format": "video|audio" }`
- **Response**:
```json
{
  "success": true,
  "downloadUrl": "string", // URL directe vers le fichier
  "filename": "string",
  "fileSize": "string",
  "duration": number
}
```

#### `GET /api/health`
- **Description**: Vérifie l'état du backend
- **Response**:
```json
{
  "status": "healthy",
  "version": "string",
  "dependencies": {
    "yt-dlp": "version",
    "ffmpeg": "version"
  }
}
```

## Technologies suggérées

- **Framework**: FastAPI (recommandé) ou Flask
- **Téléchargement vidéo**: yt-dlp (Python wrapper pour youtube-dl)
- **Traitement vidéo**: ffmpeg-python
- **Stockage**: Local (dossier `downloads/`) ou S3 pour la production

## Installation (exemple avec FastAPI)

```bash
# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install fastapi uvicorn yt-dlp ffmpeg-python python-multipart

# Lancer le serveur
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

Le frontend est configuré pour se connecter à `http://localhost:8000` par défaut.
Pour changer l'URL, modifiez `config/backend.ts` dans le frontend.

## Sécurité

- Valider les URLs YouTube en entrée
- Limiter la taille des fichiers
- Nettoyer les fichiers temporaires
- Rate limiting par IP
