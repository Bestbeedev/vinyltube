"use client";

import { useState } from "react";
import { toast } from "sonner";

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
};

export const useDownloadVideo = () => {
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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
      console.log('🔄 Extraction des informations pour:', url);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Impossible d'analyser cette vidéo YouTube");
      }

      const videoData: VideoInfo = {
        ...data,
        url: url
      };

      setVideoInfo(videoData);
      console.log('✅ Informations extraites:', videoData.title);
      toast.success(`🎬 ${videoData.formats.length} formats disponibles`);

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

  const downloadVideo = async (url: string, itag: string, quality: string) => {
    if (!videoInfo) {
      toast.error("Aucune information vidéo disponible");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      console.log('📥 Préparation téléchargement:', { itag, quality, url });

      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 200);

      const formatType = itag.includes('mp3') ? "audio" : "video";

      // Obtenir l'URL du service fiable
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

      if (!res.ok || data.error || !data.success) {
        throw new Error(data.error || "Erreur de préparation");
      }

      // Progression finale
      clearInterval(progressInterval);
      setProgress(100);

      console.log('✅ Service prêt:', data.service);

      // Ouvrir le service dans un nouvel onglet
      const downloadWindow = window.open(data.downloadUrl, '_blank');

      if (!downloadWindow) {
        toast.warning("Popup bloqué! Voici le lien direct:");

        // Copier le lien
        navigator.clipboard.writeText(data.downloadUrl);
        toast.info("Lien copié dans le presse-papier 📋");

        // Afficher aussi une notification avec le lien
        console.log('🔗 Lien direct:', data.downloadUrl);
      } else {
        toast.success(`Redirection vers ${data.service} ✅`);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
      setError(message);
      console.error('❌ Erreur téléchargement:', err);

      // Fallback manuel direct
      const fallbackUrl = itag.includes('mp3')
        ? `https://ytmp3.cc/en13/#url=${encodeURIComponent(url)}`
        : `https://en.savefrom.net/1-youtube-video-downloader/?url=${encodeURIComponent(url)}`;

      window.open(fallbackUrl, '_blank');
      toast.info("Redirection vers service de secours");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadDirect = async (url: string, itag: string, quality: string) => {
    // Méthode alternative plus directe
    const formatType = itag.includes('mp3') ? "audio" : "video";
    const directUrl = `/api/download?url=${encodeURIComponent(url)}&format=${formatType}`;

    window.open(directUrl, '_blank');
    toast.info("Ouverture du service de téléchargement...");
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
    extractVideoInfo,
    downloadVideo,
    downloadDirect,
    reset
  };
};
