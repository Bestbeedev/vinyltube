# 🚀 Backend Python pour VinylTube - Prompt IA Complet

## 📋 Objectif Principal

Créer un backend Python FastAPI qui sert le frontend Next.js de VinylTube et gère les téléchargements de vidéos YouTube avec une architecture moderne et robuste.

## 🏗️ Architecture Technique

### Stack Requis
- **Framework**: FastAPI (Python 3.9+)
- **Téléchargement vidéo**: yt-dlp
- **Traitement vidéo**: ffmpeg-python
- **Stockage**: Local avec nettoyage automatique
- **CORS**: Support pour le frontend Next.js
- **Static files**: Servir le build Next.js

### Structure des Dossiers Attendue
```
backend/
├── main.py                 # Application FastAPI principale
├── config.py              # Configuration de l'application
├── models.py              # Pydantic models pour les API
├── services/
│   ├── youtube_service.py  # Logique de téléchargement YouTube
│   └── file_service.py    # Gestion des fichiers
├── utils/
│   ├── validators.py      # Validation des URLs
│   └── cleanup.py         # Nettoyage automatique
├── downloads/             # Stockage temporaire des fichiers
├── static/               # Build du frontend Next.js
└── requirements.txt      # Dépendances Python
```

## 🎯 Spécifications Détaillées

### 1. Configuration (config.py)
```python
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "VinylTube Backend"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Serveur
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Frontend
    FRONTEND_BUILD_PATH: str = "./static"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Downloads
    DOWNLOAD_DIR: str = "./downloads"
    MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB
    CLEANUP_INTERVAL: int = 3600  # 1 heure en secondes
    FILE_RETENTION: int = 24 * 3600  # 24 heures
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW: int = 60  # secondes
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. Models Pydantic (models.py)
```python
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional, Literal
from enum import Enum

class FormatType(str, Enum):
    VIDEO = "video"
    AUDIO = "audio"

class VideoFormat(BaseModel):
    itag: str
    quality: str
    container: str
    hasAudio: bool
    hasVideo: bool
    fileSize: Optional[str] = None
    type: FormatType

class VideoInfo(BaseModel):
    title: str
    thumbnail: str
    author: str
    duration: int
    formats: List[VideoFormat]
    videoId: str
    url: HttpUrl

class ExtractRequest(BaseModel):
    url: HttpUrl
    
    @validator('url')
    def validate_youtube_url(cls, v):
        if not any(x in v for x in ['youtube.com', 'youtu.be']):
            raise ValueError('URL YouTube invalide')
        return v

class DownloadRequest(BaseModel):
    url: HttpUrl
    itag: str
    format: FormatType

class DownloadResponse(BaseModel):
    success: bool
    downloadUrl: str
    filename: str
    fileSize: str
    duration: Optional[int] = None
    message: str = "Fichier prêt pour le téléchargement"

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    dependencies: dict
    uptime: float
```

### 3. Service YouTube (services/youtube_service.py)
```python
import yt_dlp
import asyncio
from typing import List, Dict, Optional
from ..models import VideoInfo, VideoFormat, FormatType
from ..config import settings
import re

class YouTubeService:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """Extrait l'ID vidéo d'une URL YouTube"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\n]+)',
            r'youtube\.com\/watch\?.*v=([^&?\n]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def extract_video_info(self, url: str) -> VideoInfo:
        """Extrait les informations complètes d'une vidéo"""
        video_id = self.extract_video_id(url)
        if not video_id:
            raise ValueError("URL YouTube invalide")
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        loop = asyncio.get_event_loop()
        
        def _extract_info():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)
        
        try:
            info = await loop.run_in_executor(None, _extract_info)
            
            # Formater les formats disponibles
            formats = []
            for fmt in info.get('formats', []):
                if fmt.get('vcodec') != 'none' or fmt.get('acodec') != 'none':
                    video_format = VideoFormat(
                        itag=str(fmt.get('format_id', '')),
                        quality=fmt.get('format_note', fmt.get('resolution', 'Unknown')),
                        container=fmt.get('ext', 'mp4'),
                        hasAudio=fmt.get('acodec') != 'none',
                        hasVideo=fmt.get('vcodec') != 'none',
                        fileSize=self._format_file_size(fmt.get('filesize')),
                        type=FormatType.VIDEO if fmt.get('vcodec') != 'none' else FormatType.AUDIO
                    )
                    formats.append(video_format)
            
            return VideoInfo(
                title=info.get('title', 'Video sans titre'),
                thumbnail=info.get('thumbnail', f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'),
                author=info.get('uploader', 'YouTube'),
                duration=info.get('duration', 0),
                formats=formats,
                videoId=video_id,
                url=url
            )
            
        except Exception as e:
            raise RuntimeError(f"Erreur extraction vidéo: {str(e)}")
    
    def _format_file_size(self, size_bytes: Optional[int]) -> Optional[str]:
        """Formate la taille du fichier en MB"""
        if size_bytes is None:
            return None
        size_mb = size_bytes / (1024 * 1024)
        return f"{size_mb:.1f} MB"
    
    async def download_video(self, url: str, itag: str, format_type: FormatType) -> Dict:
        """Télécharge une vidéo et retourne les infos du fichier"""
        video_id = self.extract_video_id(url)
        if not video_id:
            raise ValueError("URL YouTube invalide")
        
        # Configuration de téléchargement
        download_opts = {
            'format': itag,
            'outtmpl': f'{settings.DOWNLOAD_DIR}/%(title)s_[%(id)s].%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'postprocessors': []
        }
        
        # Ajouter des post-processeurs selon le format
        if format_type == FormatType.AUDIO:
            download_opts['postprocessors'].append({
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            })
            download_opts['format'] = 'bestaudio/best'
        
        loop = asyncio.get_event_loop()
        
        def _download():
            with yt_dlp.YoutubeDL(download_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                return ydl.prepare_filename(info)
        
        try:
            filepath = await loop.run_in_executor(None, _download)
            
            # Obtenir les infos du fichier
            import os
            file_size = os.path.getsize(filepath)
            filename = os.path.basename(filepath)
            
            # Créer une URL de téléchargement relative
            download_url = f"/api/download/file/{filename}"
            
            return {
                'filepath': filepath,
                'filename': filename,
                'downloadUrl': download_url,
                'fileSize': self._format_file_size(file_size),
                'success': True
            }
            
        except Exception as e:
            raise RuntimeError(f"Erreur téléchargement: {str(e)}")
```

### 4. Application Principale (main.py)
```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import time
import os
import asyncio
from contextlib import asynccontextmanager

from .config import settings
from .models import (
    ExtractRequest, DownloadRequest, VideoInfo, 
    DownloadResponse, HealthResponse
)
from .services.youtube_service import YouTubeService
from .utils.cleanup import CleanupScheduler
from .utils.validators import validate_url, rate_limiter

# Variables globales
youtube_service = YouTubeService()
cleanup_scheduler = CleanupScheduler()
start_time = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle de l'application"""
    # Démarrage
    print(f"🚀 {settings.APP_NAME} v{settings.VERSION} démarré")
    print(f"📁 Dossier downloads: {settings.DOWNLOAD_DIR}")
    
    # Créer les dossiers nécessaires
    os.makedirs(settings.DOWNLOAD_DIR, exist_ok=True)
    os.makedirs(settings.FRONTEND_BUILD_PATH, exist_ok=True)
    
    # Démarrer le scheduler de nettoyage
    cleanup_task = asyncio.create_task(cleanup_scheduler.start())
    
    yield
    
    # Arrêt
    cleanup_task.cancel()
    print("👋 Backend arrêté")

# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Backend Python pour VinylTube - Téléchargement YouTube",
    lifespan=lifespan
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# Servir les fichiers statiques du frontend
if os.path.exists(os.path.join(settings.FRONTEND_BUILD_PATH, "index.html")):
    app.mount("/static", StaticFiles(directory=settings.FRONTEND_BUILD_PATH), name="static")

@app.get("/")
async def serve_frontend():
    """Servir le frontend Next.js"""
    frontend_path = os.path.join(settings.FRONTEND_BUILD_PATH, "index.html")
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    return JSONResponse({"message": "Frontend non trouvé. Build le frontend Next.js d'abord."})

@app.post("/api/extract")
async def extract_video_info(request: ExtractRequest):
    """Extrait les informations d'une vidéo YouTube"""
    try:
        # Rate limiting
        if not rate_limiter(request):
            raise HTTPException(status_code=429, detail="Trop de requêtes")
        
        # Validation
        validate_url(request.url)
        
        # Extraction
        video_info = await youtube_service.extract_video_info(str(request.url))
        
        return video_info
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur interne")

@app.post("/api/download")
async def download_video(request: DownloadRequest):
    """Prépare et sert le téléchargement d'une vidéo"""
    try:
        # Rate limiting
        if not rate_limiter(request):
            raise HTTPException(status_code=429, detail="Trop de requêtes")
        
        # Validation
        validate_url(request.url)
        
        # Téléchargement
        download_info = await youtube_service.download_video(
            str(request.url), 
            request.itag, 
            request.format
        )
        
        return DownloadResponse(
            success=True,
            downloadUrl=download_info['downloadUrl'],
            filename=download_info['filename'],
            fileSize=download_info['fileSize'],
            message="Fichier prêt pour le téléchargement"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors du téléchargement")

@app.get("/api/download/file/{filename}")
async def serve_file(filename: str):
    """Sert un fichier téléchargé"""
    try:
        file_path = os.path.join(settings.DOWNLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Fichier non trouvé")
        
        # Vérifier la taille du fichier
        file_size = os.path.getsize(file_path)
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Fichier trop volumineux")
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors du service du fichier")

@app.get("/api/health")
async def health_check():
    """Vérifie l'état du backend"""
    try:
        # Vérifier les dépendances
        import yt_dlp
        import ffmpeg
        
        dependencies = {
            'yt-dlp': yt_dlp.__version__,
            'ffmpeg-python': ffmpeg.__version__,
        }
        
        # Vérifier l'espace disque
        import shutil
        total, used, free = shutil.disk_usage(settings.DOWNLOAD_DIR)
        
        return HealthResponse(
            status="healthy",
            version=settings.VERSION,
            dependencies=dependencies,
            uptime=time.time() - start_time
        )
        
    except Exception as e:
        return JSONResponse(
            {
                "status": "unhealthy",
                "error": str(e),
                "version": settings.VERSION
            },
            status_code=503
        )

@app.get("/api/stats")
async def get_stats():
    """Statistiques du backend"""
    try:
        import os
        
        # Compter les fichiers dans downloads
        download_files = []
        if os.path.exists(settings.DOWNLOAD_DIR):
            download_files = [f for f in os.listdir(settings.DOWNLOAD_DIR) 
                             if os.path.isfile(os.path.join(settings.DOWNLOAD_DIR, f))]
        
        total_size = sum(
            os.path.getsize(os.path.join(settings.DOWNLOAD_DIR, f)) 
            for f in download_files
        )
        
        return {
            "downloads_count": len(download_files),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "uptime_seconds": time.time() - start_time,
            "download_dir": settings.DOWNLOAD_DIR
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
```

### 5. Utilitaires (utils/validators.py)
```python
import time
from typing import Dict
from fastapi import Request
import re

# Rate limiting simple en mémoire
rate_limit_store: Dict[str, Dict] = {}

def validate_url(url: str) -> None:
    """Valide une URL YouTube"""
    if not url:
        raise ValueError("URL requise")
    
    youtube_patterns = [
        r'https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'https?://(?:www\.)?youtu\.be/[\w-]+',
        r'https?://(?:www\.)?youtube\.com/embed/[\w-]+'
    ]
    
    if not any(re.match(pattern, url) for pattern in youtube_patterns):
        raise ValueError("URL YouTube invalide")

def rate_limiter(request: Request, limit: int = 10, window: int = 60) -> bool:
    """Rate limiting simple par IP"""
    client_ip = request.client.host
    current_time = time.time()
    
    # Nettoyer les anciennes entrées
    if client_ip in rate_limit_store:
        rate_limit_store[client_ip] = {
            req_time for req_time in rate_limit_store[client_ip]
            if current_time - req_time < window
        }
    else:
        rate_limit_store[client_ip] = set()
    
    # Vérifier la limite
    if len(rate_limit_store[client_ip]) >= limit:
        return False
    
    # Ajouter la requête actuelle
    rate_limit_store[client_ip].add(current_time)
    return True
```

### 6. Nettoyage Automatique (utils/cleanup.py)
```python
import asyncio
import os
import time
from typing import List
from ..config import settings

class CleanupScheduler:
    def __init__(self):
        self.running = False
    
    async def start(self):
        """Démarre le scheduler de nettoyage"""
        self.running = True
        while self.running:
            try:
                await self.cleanup_old_files()
                await asyncio.sleep(settings.CLEANUP_INTERVAL)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Erreur cleanup: {e}")
                await asyncio.sleep(60)  # Attendre 1 min en cas d'erreur
    
    async def cleanup_old_files(self):
        """Nettoie les fichiers plus vieux que FILE_RETENTION"""
        if not os.path.exists(settings.DOWNLOAD_DIR):
            return
        
        current_time = time.time()
        cleaned_files = []
        
        for filename in os.listdir(settings.DOWNLOAD_DIR):
            filepath = os.path.join(settings.DOWNLOAD_DIR, filename)
            
            if os.path.isfile(filepath):
                file_age = current_time - os.path.getmtime(filepath)
                
                if file_age > settings.FILE_RETENTION:
                    try:
                        os.remove(filepath)
                        cleaned_files.append(filename)
                    except Exception as e:
                        print(f"Erreur suppression {filename}: {e}")
        
        if cleaned_files:
            print(f"🧹 Nettoyé {len(cleaned_files)} fichiers: {cleaned_files}")
    
    def stop(self):
        """Arrête le scheduler"""
        self.running = False
```

### 7. Dépendances (requirements.txt)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
yt-dlp==2023.12.30
ffmpeg-python==0.2.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
aiofiles==23.2.1
```

### 8. Configuration Environnement (.env)
```env
# Application
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Frontend
FRONTEND_URL=http://localhost:3000
FRONTEND_BUILD_PATH=./static

# Downloads
DOWNLOAD_DIR=./downloads
MAX_FILE_SIZE=524288000
CLEANUP_INTERVAL=3600
FILE_RETENTION=86400

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

## 🚀 Instructions de Déploiement

### 1. Installation
```bash
# Cloner le projet et aller dans backend/
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
```

### 2. Build du Frontend
```bash
# Depuis la racine du projet
cd ../
npm run build
cp -r out/* backend/static/
```

### 3. Démarrage
```bash
# Démarrer le backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Accès
- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/api/health

## 🔧 Tests et Validation

### Test API
```bash
# Health check
curl http://localhost:8000/api/health

# Extract video info
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Validation Frontend
1. L'indicateur backend doit être 🟢 vert
2. Les téléchargements doivent fonctionner localement
3. Les fichiers doivent apparaître dans `downloads/`

## 🎯 Points Clés à Implémenter

1. **Gestion d'erreurs robuste** avec messages clairs
2. **Rate limiting** pour éviter les abus
3. **Nettoyage automatique** des fichiers
4. **Support CORS** pour le frontend
5. **Servir le frontend** depuis le même port
6. **Logging** pour le debugging
7. **Validation stricte** des URLs YouTube
8. **Timeout management** pour les téléchargements longs

Le backend doit être capable de fonctionner en standalone tout en servant le frontend Next.js buildé, avec une architecture évolutive pour la production.
