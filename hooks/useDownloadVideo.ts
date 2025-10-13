"use client";

import { useState } from "react";
import { toast } from "sonner";

export type VideoFormat = {
  quality: string;
  itag: number;
  container: string;
  hasAudio: boolean;
  hasVideo: boolean;
};

export type VideoInfo = {
  title: string;
  thumbnail?: string;
  author: string;
  duration: number;
  formats: VideoFormat[];
};

export const useDownloadVideo = () => {
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /** Extraction des infos de la vidéo */
  const extractVideoInfo = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      toast.error("Veuillez entrer un lien YouTube valide.");
      return false;
    }

    setLoading(true);
    setVideoInfo(null);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Impossible d’extraire la vidéo");
      }

      setVideoInfo(data);
      toast.success("Vidéo analysée avec succès 🎬");
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

  /** Télécharger la vidéo/audio avec fusion si nécessaire */
  const downloadVideo = async (itag?: string, format?: "audio" | "video") => {
    if (!videoInfo) return;

    setLoading(true);
    setProgress(0);

    try {
      const body: Record<string, string> = { url: "" };
      body.url = videoInfo.title; // ou stocker url dans videoInfo

      if (itag) body.itag = itag;
      if (format) body.format = format;

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur téléchargement");
      }

      const blob = await res.blob();

      // Simule progression
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 80));
        setProgress(i);
      }

      const a = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      a.href = urlBlob;
      a.download = `${videoInfo.title}.${format === "audio" ? "mp3" : "mp4"}`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      toast.success(`Téléchargement terminé ✅`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    loading,
    videoInfo,
    progress,
    error,
    extractVideoInfo,
    downloadVideo,
  };
};
