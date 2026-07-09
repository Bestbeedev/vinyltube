'use client';

import { useState, useEffect } from 'react';
import { Download, Video, AudioLinesIcon, Clock, User, HardDrive, Sparkles, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDownloadVideo } from '@/hooks/useDownloadVideo';
import { toast } from 'sonner';

const SUPPORTED_PLATFORMS = [
    { name: 'YouTube', pattern: /youtube\.com|youtu\.be/ },
    { name: 'Vimeo', pattern: /vimeo\.com/ },
    { name: 'Twitter/X', pattern: /twitter\.com|x\.com/ },
    { name: 'Instagram', pattern: /instagram\.com/ },
    { name: 'TikTok', pattern: /tiktok\.com/ },
    { name: 'Dailymotion', pattern: /dailymotion\.com/ },
    { name: 'Twitch', pattern: /twitch\.tv/ },
    { name: 'Reddit', pattern: /reddit\.com/ },
    { name: 'Facebook', pattern: /facebook\.com|fb\.watch/ },
    { name: 'SoundCloud', pattern: /soundcloud\.com/ },
];

function detectPlatform(url: string): string | null {
    for (const p of SUPPORTED_PLATFORMS) {
        if (p.pattern.test(url)) return p.name;
    }
    return null;
}

function isValidUrl(text: string): boolean {
    return /^https?:\/\/.+\..+/i.test(text.trim());
}

export default function VideoForm() {
    const [url, setUrl] = useState('');
    const [open, setOpen] = useState(false);
    const [isAutoExtracting, setIsAutoExtracting] = useState(false);
    const { loading, videoInfo, progress, backendStatus, isDownloading, extractVideoInfo, downloadVideo } = useDownloadVideo();

    const detectedPlatform = detectPlatform(url);

    useEffect(() => {
        if (url.trim() && isValidUrl(url) && !loading && !isAutoExtracting && !videoInfo) {
            const timer = setTimeout(async () => {
                setIsAutoExtracting(true);
                const success = await extractVideoInfo(url);
                if (success) setOpen(true);
                setIsAutoExtracting(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [url, loading, isAutoExtracting, videoInfo, extractVideoInfo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim() || !isValidUrl(url)) {
            toast.error("Veuillez entrer une URL valide.");
            return;
        }
        const success = await extractVideoInfo(url);
        if (success) setOpen(true);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getFormatIcon = (hasAudio: boolean, hasVideo: boolean) => {
        if (!hasVideo) return <AudioLinesIcon className="w-4 h-4" />;
        if (!hasAudio) return <Video className="w-4 h-4" />;
        return <Download className="w-4 h-4" />;
    };

    const getQualityColor = (quality: string) => {
        if (quality.includes('1080')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        if (quality.includes('720')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        if (quality.includes('480')) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    };

    const statusIcon = backendStatus === 'online'
        ? <Wifi className="w-4 h-4 text-green-500" />
        : backendStatus === 'offline'
        ? <WifiOff className="w-4 h-4 text-red-500" />
        : <AlertTriangle className="w-4 h-4 text-amber-500" />;

    const statusText = backendStatus === 'online'
        ? 'Backend connecté'
        : backendStatus === 'offline'
        ? 'Backend hors ligne'
        : 'Vérification...';

    const statusColor = backendStatus === 'online'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : backendStatus === 'offline'
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Collez un lien YouTube, Vimeo, TikTok, Instagram..."
                            className={`w-full px-6 py-7 bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-lg shadow-lg backdrop-blur-sm ${
                                isAutoExtracting ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20' : ''
                            }`}
                        />
                        {detectedPlatform && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                {detectedPlatform}
                            </span>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || isAutoExtracting}
                        className="px-8 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-2xl font-semibold text-white transition-all flex items-center justify-center space-x-3 min-w-[160px] shadow-lg hover:shadow-xl"
                    >
                        {(loading || isAutoExtracting) ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{isAutoExtracting ? 'Détection...' : 'Analyse...'}</span>
                            </div>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Analyser</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-center mt-6 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Badge className={`flex items-center space-x-1 ${statusColor}`}>
                            {statusIcon}
                            <span className="text-xs">{statusText}</span>
                        </Badge>
                    </div>
                    {isAutoExtracting && (
                        <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                            <span>Détection automatique...</span>
                        </div>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        💡 Fonctionne avec YouTube, Vimeo, TikTok, Instagram, Twitter/X, Dailymotion et plus
                    </p>
                </div>
            </form>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
                    {videoInfo && (
                        <div className="relative">
                            {videoInfo.thumbnail && (
                                <div className="absolute inset-0 overflow-hidden rounded-t-xl">
                                    <img src={videoInfo.thumbnail} alt="" className="w-full h-full object-cover blur-sm opacity-20" />
                                </div>
                            )}
                            <div className="relative p-6 pb-4">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-lg">
                                        <Download className="w-5 h-5 text-amber-500" />
                                        Télécharger
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="flex gap-4 mt-4">
                                    {videoInfo.thumbnail && (
                                        <img
                                            src={videoInfo.thumbnail}
                                            alt="Miniature"
                                            className="w-28 h-16 object-cover rounded-lg flex-shrink-0 shadow-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{videoInfo.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{videoInfo.author}</span>
                                            {videoInfo.duration > 0 && (
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(videoInfo.duration)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-6 pb-6 space-y-4">
                        {(loading || isDownloading || videoInfo?.hasFormats === false) && (
                            <div className="rounded-xl border px-4 py-3 space-y-2 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
                                <div className="flex items-center justify-between text-sm font-medium text-amber-800 dark:text-amber-300">
                                    <span className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                        {isDownloading
                                            ? `Téléchargement de « ${videoInfo?.title ?? 'fichier'} »...`
                                            : loading
                                            ? 'Analyse en cours...'
                                            : 'Chargement des formats...'}
                                    </span>
                                    {isDownloading && (
                                        <span className="tabular-nums text-xs">{progress.toFixed(0)} %</span>
                                    )}
                                </div>
                                <Progress
                                    value={isDownloading ? progress : undefined}
                                    className={`h-1.5 ${isDownloading ? '' : '[&>div]:animate-pulse'}`}
                                />
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    {isDownloading
                                        ? 'Ne fermez pas cette fenêtre.'
                                        : loading
                                        ? 'Récupération des informations...'
                                        : 'Les formats arrivent, vous pouvez déjà choisir ci-dessous.'}
                                </p>
                            </div>
                        )}

                        {videoInfo && (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                        <Video className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                            {videoInfo.formats?.filter(f => f.hasVideo).length || 0}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">vidéo</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                                        <AudioLinesIcon className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                            {videoInfo.formats?.filter(f => !f.hasVideo).length || 0}
                                        </span>
                                        <span className="text-xs text-green-600 dark:text-green-400">audio</span>
                                    </div>
                                </div>

                                {videoInfo.formats && videoInfo.formats.length > 0 ? (
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                                        {videoInfo.formats
                                            .sort((a, b) => {
                                                if (a.hasVideo && !b.hasVideo) return -1;
                                                if (!a.hasVideo && b.hasVideo) return 1;
                                                return (b.quality || '').localeCompare(a.quality || '');
                                            })
                                            .map((format, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group"
                                                    onClick={() => downloadVideo(videoInfo.url, format.itag.toString(), format.quality)}
                                                >
                                                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors flex-shrink-0">
                                                        {getFormatIcon(format.hasAudio, format.hasVideo)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm">{format.quality || 'Audio'}</span>
                                                            <Badge className={`text-xs px-1.5 py-0 ${getQualityColor(format.quality)}`}>
                                                                {format.container?.toUpperCase()}
                                                            </Badge>
                                                            {!format.hasVideo && (
                                                                <Badge className="text-xs px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                    Audio
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {format.fileSize && (
                                                            <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                                                                <HardDrive className="w-3 h-3" />
                                                                {format.fileSize}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            downloadVideo(videoInfo.url, format.itag.toString(), format.quality);
                                                        }}
                                                    >
                                                        <Download className="w-3.5 h-3.5 mr-1" />
                                                        DL
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-neutral-400">
                                        <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm font-medium">
                                            {videoInfo.hasFormats === false ? 'Chargement des formats...' : 'Aucun format disponible'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                                    <span className="text-green-500 text-sm">✅</span>
                                    <p className="text-xs text-green-700 dark:text-green-400">
                                        Fichiers MP4/MP3 haute qualité traités par notre backend
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
