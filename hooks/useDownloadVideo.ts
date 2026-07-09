import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BACKEND_CONFIG } from '@/config/backend';
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
  hasFormats?: boolean;
};

export const useDownloadVideo = () => {
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => setBackendStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const extractVideoInfo = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      toast.error("Veuillez entrer une URL valide.");
      return false;
    }

    setLoading(true);
    setVideoInfo(null);
    setError(null);
    setProgress(0);

    try {
      const fastResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fast: true }),
      });

      if (!fastResponse.ok) {
        const errorData = await fastResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Impossible d'analyser cette vidéo");
      }

      const fastData = await fastResponse.json();
      setVideoInfo({ ...fastData, url, formats: [], hasFormats: false });
      toast.success(`🎬 Vidéo détectée: ${fastData.title}`);
      loadFormatsInBackground(url);
      return true;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadFormatsInBackground = async (url: string) => {
    try {
      const fullResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!fullResponse.ok) throw new Error("Erreur lors du chargement des formats");

      const fullData = await fullResponse.json();
      setVideoInfo(prev => prev ? { ...prev, formats: fullData.formats || [], hasFormats: true } : null);
      toast.success(`🎯 ${fullData.formats?.length || 0} formats disponibles`);

    } catch (err) {
      console.error('Erreur chargement formats:', err);
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
    setIsDownloading(true);

    try {
      const format = videoInfo.formats.find(f => f.itag === itag);
      const formatType = format ? (format.hasVideo ? "video" : "audio") : (itag.includes('mp3') ? "audio" : "video");

      // 1. Démarrer le job côté backend
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, itag, format: formatType }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur de démarrage du téléchargement");
      }

      const { job_id } = data;

      // 2. Suivre la progression via SSE
      await new Promise<void>((resolve, reject) => {
        const es = new EventSource(`/api/download/progress/${job_id}`);

        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);

            if (payload.error) {
              es.close();
              reject(new Error(payload.error));
              return;
            }

            setProgress(payload.progress ?? 0);

            if (payload.status === 'done') {
              es.close();

              const backendBaseUrl = BACKEND_CONFIG.BASE_URL;
              const rawUrl: string = payload.downloadUrl ?? '';
              const fullDownloadUrl = rawUrl.startsWith('/')
                ? `${backendBaseUrl}${rawUrl}`
                : `${backendBaseUrl}/${rawUrl}`;

              HistoryService.addToHistory({
                title: payload.filename || videoInfo.title,
                url,
                format: formatType as 'video' | 'audio',
                quality,
                size: payload.fileSize || 'N/A',
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
              });

              window.open(fullDownloadUrl, '_blank');
              toast.success(`✅ Fichier "${payload.filename}" prêt !`);

              setTimeout(() => {
                setIsDownloading(false);
                if (typeof window !== 'undefined') window.location.href = '/history';
              }, 3000);

              resolve();
            }
          } catch (parseErr) {
            es.close();
            reject(parseErr);
          }
        };

        es.onerror = () => {
          es.close();
          reject(new Error("Connexion SSE perdue"));
        };
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
      setError(message);
      toast.error(message);
      setIsDownloading(false);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const reset = () => {
    setVideoInfo(null);
    setError(null);
    setProgress(0);
    setLoading(false);
    setIsDownloading(false);
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
    reset,
  };
};
