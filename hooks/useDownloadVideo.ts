import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BACKEND_CONFIG, BACKEND_ENDPOINTS, getBackendUrl } from '@/config/backend';
import HistoryService from '@/lib/history-service';

export type VideoFormat = {
  itag: string;
  quality: string;
  container: string;
  hasAudio: boolean;
  hasVideo: boolean;
  fileSize?: string;
  type?: string;
};

export type VideoInfo = {
  title: string;
  thumbnail?: string;
  author: string;
  duration: number;
  formats: VideoFormat[];
  url: string;
  videoId?: string;
  warning?: string;
  hasFormats?: boolean; // Indique si les formats ont été chargés
};

export const useDownloadVideo = () => {
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isDownloading, setIsDownloading] = useState(false); // État global pour suivre les téléchargements

  // Check backend status on mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
  }, []);

  const extractVideoInfo = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      toast.error("Veuillez entrer un lien YouTube valide.");
      return false;
    }

    setLoading(true);
    setVideoInfo(null);
    setError(null);
    setProgress(0);

    try {
      console.log('� Extraction rapide des informations pour:', url);

      // Étape 1: Extraction rapide des infos de base
      const fastResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fast: true }),
      });

      if (!fastResponse.ok) {
        const errorData = await fastResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Impossible d'analyser cette vidéo YouTube");
      }

      const fastData = await fastResponse.json();
      
      // Créer les infos de base avec formats vides
      const baseVideoData: VideoInfo = {
        ...fastData,
        url: url,
        formats: [], // Formats vides initialement
        hasFormats: false
      };

      setVideoInfo(baseVideoData);
      console.log(`✅ Infos rapides extraites: "${fastData.title}"`);
      
      // Étape 2: Charger les formats en arrière-plan
      console.log('🔄 Chargement des formats complets en arrière-plan...');
      loadFormatsInBackground(url);
      
      toast.success(`🎬 Vidéo détectée: ${fastData.title}`);
      return true;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      console.error('❌ Erreur extraction:', err);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadFormatsInBackground = async (url: string) => {
    try {
      console.log('⏳ Extraction des formats complets pour:', url);
      
      const fullResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!fullResponse.ok) {
        throw new Error("Erreur lors du chargement des formats");
      }

      const fullData = await fullResponse.json();
      
      // Mettre à jour les videoInfo avec les formats complets
      setVideoInfo(prev => prev ? {
        ...prev,
        formats: fullData.formats || [],
        hasFormats: true
      } : null);
      
      console.log(`✅ Formats chargés: ${fullData.formats?.length || 0} formats disponibles`);
      toast.success(`🎯 ${fullData.formats?.length || 0} formats de téléchargement disponibles`);
      
    } catch (error) {
      console.error('❌ Erreur chargement formats:', error);
      toast.warning('⚠️ Impossible de charger les formats de téléchargement');
    }
  };

  const downloadVideo = async (url: string, itag: string, quality: string) => {
    if (!videoInfo) {
      toast.error("Aucune information vidéo disponible");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setIsDownloading(true); // Marquer qu'un téléchargement est en cours

    try {
      console.log('📥 Préparation téléchargement:', { itag, quality, url });

      const formatType = itag.includes('mp3') ? "audio" : "video";

      // Progression simulée
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          itag: itag,
          format: formatType
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur de préparation du téléchargement");
      }

      clearInterval(progressInterval);
      setProgress(100);

      console.log('✅ Téléchargement prêt:', data);

      // Ajouter à l'historique local immédiatement
      const historyItem = {
        title: data.filename || videoInfo.title,
        url: url,
        format: formatType as 'video' | 'audio',
        quality: quality,
        size: data.fileSize || 'N/A',
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail
      };
      
      // Ajouter immédiatement à l'historique via le service
      HistoryService.addToHistory(historyItem);
      
      console.log('📝 Item ajouté à l\'historique via service:', historyItem);

      // Gérer la réponse du backend Python uniquement
      if (data.downloadUrl) {
        // Construire l'URL complète du backend pour le téléchargement
        const backendBaseUrl = 'http://localhost:8000';
        const fullDownloadUrl = data.downloadUrl.startsWith('/') 
          ? `${backendBaseUrl}${data.downloadUrl}`
          : `${backendBaseUrl}/${data.downloadUrl}`;
        
        console.log('📥 URL de téléchargement complète:', fullDownloadUrl);
        
        // Ouvrir le téléchargement dans un nouvel onglet
        window.open(fullDownloadUrl, '_blank');
        
        // Afficher un toast de succès
        toast.success(`✅ Fichier "${data.filename}" téléchargé avec succès!`);
        
        // Attendre un peu plus longtemps pour s'assurer que le téléchargement commence
        setTimeout(() => {
          setIsDownloading(false); // Marquer le téléchargement comme terminé
          if (typeof window !== 'undefined') {
            window.location.href = '/history';
          }
        }, 5000); // 5 secondes pour laisser le temps au téléchargement de commencer
        
      } else if (data.fileUrl) {
        // Construire l'URL complète du backend
        const backendBaseUrl = 'http://localhost:8000';
        const fullFileUrl = data.fileUrl.startsWith('/') 
          ? `${backendBaseUrl}${data.fileUrl}`
          : `${backendBaseUrl}/${data.fileUrl}`;
        
        console.log('📂 URL du fichier complète:', fullFileUrl);
        
        // Ouvrir le fichier dans un nouvel onglet
        window.open(fullFileUrl, '_blank');
        
        // Afficher un toast de succès
        toast.success(`✅ Fichier prêt: ${data.filename}`);
        
        // Attendre un peu plus longtemps pour s'assurer que le téléchargement commence
        setTimeout(() => {
          setIsDownloading(false); // Marquer le téléchargement comme terminé
          if (typeof window !== 'undefined') {
            window.location.href = '/history';
          }
        }, 5000); // 5 secondes pour laisser le temps au téléchargement de commencer
        
      } else {
        throw new Error("Aucune URL de téléchargement fournie par le backend");
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
      setError(message);
      console.error('❌ Erreur téléchargement:', err);
      toast.error(message);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
      // Ne pas réinitialiser isDownloading immédiatement en cas d'erreur
      if (loading && !error) {
        setTimeout(() => setIsDownloading(false), 3000);
      }
    }
  };

  const downloadDirect = async (url: string, itag: string, quality: string) => {
    // Méthode alternative plus directe - backend uniquement
    const formatType = itag.includes('mp3') ? "audio" : "video";
    
    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${formatType}`);
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur lors du téléchargement direct");
      }
      
      if (data.fileUrl) {
        // Construire l'URL complète du backend
        const backendBaseUrl = 'http://localhost:8000';
        const fullFileUrl = data.fileUrl.startsWith('/') 
          ? `${backendBaseUrl}${data.fileUrl}`
          : `${backendBaseUrl}/${data.fileUrl}`;
        
        // Téléchargement direct depuis notre backend
        window.open(fullFileUrl, '_blank');
        toast.success(`✅ Fichier prêt: ${data.filename}`);
      } else if (data.downloadUrl) {
        // Construire l'URL complète du backend
        const backendBaseUrl = 'http://localhost:8000';
        const fullDownloadUrl = data.downloadUrl.startsWith('/') 
          ? `${backendBaseUrl}${data.downloadUrl}`
          : `${backendBaseUrl}/${data.downloadUrl}`;
        
        const link = document.createElement('a');
        link.href = fullDownloadUrl;
        link.download = data.filename || `video.${formatType === 'audio' ? 'mp3' : 'mp4'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`✅ Fichier "${data.filename}" téléchargé avec succès!`);
      } else {
        throw new Error("Aucune URL de téléchargement fournie par le backend");
      }
    } catch (error) {
      console.error('Erreur download direct:', error);
      const message = error instanceof Error ? error.message : "Erreur lors du téléchargement direct";
      toast.error(message);
    }
  };

  const reset = () => {
    setVideoInfo(null);
    setError(null);
    setProgress(0);
    setLoading(false);
  };

  return {
    loading,
    videoInfo,
    progress,
    error,
    backendStatus,
    isDownloading,
    extractVideoInfo,
    downloadVideo,
    downloadDirect,
    reset
  };
};
