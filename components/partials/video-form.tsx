'use client';

import { useState, useEffect } from 'react';
import { Download, ClipboardPaste, Video, AudioLinesIcon, Clock, User, HardDrive, Sparkles, Zap, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDownloadVideo } from '@/hooks/useDownloadVideo';
import { toast } from 'sonner';

export default function VideoForm() {
    const [url, setUrl] = useState('');
    const [open, setOpen] = useState(false);
    const [isAutoExtracting, setIsAutoExtracting] = useState(false);
    const { loading, videoInfo, progress, backendStatus, extractVideoInfo, downloadVideo } = useDownloadVideo();

    // Extraction automatique quand une URL YouTube est collée
    useEffect(() => {
        const isValidYouTubeUrl = (text: string) => {
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&?\n]+)/;
            return youtubeRegex.test(text.trim());
        };

        // Si l'URL est valide et qu'on n'est pas déjà en train de charger/extraire
        if (url.trim() && isValidYouTubeUrl(url) && !loading && !isAutoExtracting && !videoInfo) {
            const timer = setTimeout(async () => {
                setIsAutoExtracting(true);
                console.log('🚀 Extraction automatique déclenchée pour:', url);
                const success = await extractVideoInfo(url);
                if (success) {
                    setOpen(true);
                }
                setIsAutoExtracting(false);
            }, 800); // Délai de 800ms pour éviter les déclenchements intempestifs

            return () => clearTimeout(timer);
        }
    }, [url, loading, isAutoExtracting, videoInfo, extractVideoInfo]);

    const getBackendStatusIcon = () => {
        switch (backendStatus) {
            case 'online':
                return <Wifi className="w-4 h-4 text-green-500" />;
            case 'offline':
                return <WifiOff className="w-4 h-4 text-red-500" />;
            case 'checking':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        }
    };

    const getBackendStatusText = () => {
        switch (backendStatus) {
            case 'online':
                return 'Backend Python connecté';
            case 'offline':
                return 'Mode fallback (services externes)';
            case 'checking':
                return 'Vérification du backend...';
        }
    };

    const getBackendStatusColor = () => {
        switch (backendStatus) {
            case 'online':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'offline':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'checking':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            toast.error("Veuillez entrer un lien YouTube valide.");
            return;
        }

        const success = await extractVideoInfo(url);
        if (success) setOpen(true);
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getFileSizeEstimate = (quality: string, hasAudio: boolean, hasVideo: boolean) => {
        if (!hasVideo) return "~3-10 MB"; // Audio seulement
        if (quality.includes('1080')) return "~50-150 MB";
        if (quality.includes('720')) return "~20-80 MB";
        return "~5-30 MB";
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

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">

                        <Input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Collez le lien YouTube ici..."
                            className={`w-full px-6 py-7 bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-lg shadow-sm backdrop-blur-sm ${
                                isAutoExtracting ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20' : ''
                            }`}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || isAutoExtracting}
                        className="px-8 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-green-600 disabled:to-green-700 disabled:cursor-not-allowed rounded-2xl font-semibold text-white transition-all flex items-center justify-center space-x-3 min-w-[160px] shadow-lg hover:shadow-xl"
                    >
                        {(loading || isAutoExtracting) ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="sm:inline ">
                                    {isAutoExtracting ? 'Auto-extraction...' : 'Extraction...'}
                                </span>
                            </div>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span className="sm:inline ">Analyser</span>
                            </>
                        )}
                    </Button>
                </div>
                <div className="text-center mt-6">
                    {/* Indicateur de statut backend */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <Badge className={`flex items-center space-x-1 ${getBackendStatusColor()}`}>
                            {getBackendStatusIcon()}
                            <span className="text-xs">{getBackendStatusText()}</span>
                        </Badge>
                    </div>
                    
                    {/* Message d'auto-extraction */}
                    {isAutoExtracting && (
                        <div className="mb-3 text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                            <span>Détection automatique de la vidéo...</span>
                        </div>
                    )}
                    
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        🔒 Traitement sécurisé et privé via notre backend
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        💡 L'extraction se lance automatiquement quand vous collez un lien YouTube
                    </p>
                </div>
            </form>

            {/* === DIALOG AMÉLIORÉ === */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Video className="w-6 h-6 text-amber-500" />
                            Options de téléchargement
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Choisissez le format et la qualité pour votre téléchargement
                        </DialogDescription>
                    </DialogHeader>

                    {loading && (
                        <div className="space-y-3">
                            <Progress value={progress} className="h-2 text-green-600" />
                            <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
                                Analyse de la vidéo en cours...
                            </p>
                        </div>
                    )}

                    {videoInfo && (
                        // Dans votre VideoForm, remplacez la section des formats par :
                        <div className="space-y-6">
                            {/* En-tête de la vidéo */}
                            <Card className="overflow-hidden border-2 border-amber-100 dark:border-amber-900/50">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        <img
                                            src={videoInfo.thumbnail}
                                            alt="Miniature"
                                            className="w-full lg:w-64 h-48 lg:h-36 object-cover"
                                        />
                                        <div className="p-6 flex-1">
                                            <h3 className="font-semibold text-xl mb-3 line-clamp-2">
                                                {videoInfo.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-5 h-5" />
                                                    <span className="font-medium">{videoInfo.author}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5" />
                                                    <span className="font-medium">{formatDuration(videoInfo.duration)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DEBUG: Afficher les données brutes */}
                            {/* <details className="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded">
                                <summary className="cursor-pointer font-mono">Debug Data</summary>
                                <pre className="mt-2 whitespace-pre-wrap">
                                    {JSON.stringify(videoInfo, null, 2)}
                                </pre>
                            </details> */}

                            {/* Filtres rapides */}
                            {/* <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="cursor-pointer hover:bg-amber-100">
                                    Tous les formats
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                                    <Video className="w-3 h-3 mr-1" />
                                    Vidéo seulement
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-green-100">
                                    <AudioLinesIcon className="w-3 h-3 mr-1" />
                                    Audio seulement
                                </Badge>
                            </div> */}

                            {/* Statistiques */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50">
                                    <CardContent className="p-4">
                                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                            {videoInfo.formats?.length || 0}
                                        </div>
                                        <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            {videoInfo.hasFormats === false ? 'Chargement...' : 'Formats disponibles'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50">
                                    <CardContent className="p-4">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {videoInfo.formats?.filter(f => f.hasVideo).length || 0}
                                        </div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Formats vidéo</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                                    <CardContent className="p-4">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {videoInfo.formats?.filter(f => !f.hasVideo).length || 0}
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">Formats audio</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Liste des formats */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2 text-lg">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Formats disponibles ({videoInfo.formats?.length || 0})
                                </h4>

                                {videoInfo.formats && videoInfo.formats.length > 0 ? (
                                    <>
                                        {videoInfo.hasFormats === false && (
                                            <div className="text-center py-8 text-amber-600 dark:text-amber-400">
                                                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                                <p className="font-medium">Chargement des formats de téléchargement...</p>
                                                <p className="text-sm mt-1">Les informations de base sont déjà disponibles</p>
                                            </div>
                                        )}
                                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                                        {videoInfo.formats
                                            .sort((a, b) => {
                                                if (a.hasVideo && !b.hasVideo) return -1;
                                                if (!a.hasVideo && b.hasVideo) return 1;
                                                return (b.quality || '').localeCompare(a.quality || '');
                                            })
                                            .map((format, index) => (
                                                <Card
                                                    key={index}
                                                    className="cursor-pointer transition-all hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700"
                                                    onClick={() => downloadVideo(videoInfo.url, format.itag.toString(), format.quality)}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 transition-transform">
                                                                    {getFormatIcon(format.hasAudio, format.hasVideo)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="font-bold text-lg">
                                                                            {format.quality || 'Audio'}
                                                                        </span>
                                                                        <Badge className={`text-sm ${getQualityColor(format.quality)}`}>
                                                                            {format.container?.toUpperCase()}
                                                                        </Badge>
                                                                    </div>
                                                                    {format.fileSize && (
                                                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                                                            <HardDrive className="w-4 h-4" />
                                                                            <span>{format.fileSize}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="lg"
                                                                className="bg-amber-500 hover:bg-amber-600 px-6 py-3 text-base font-semibold"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    downloadVideo(videoInfo.url, format.itag.toString(), format.quality);
                                                                }}
                                                            >
                                                                <Download className="w-5 h-5 mr-2" />
                                                                Télécharger
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">
                                            {videoInfo.hasFormats === false ? 'Chargement des formats...' : 'Aucun format disponible'}
                                        </p>
                                        <p className="text-sm">
                                            {videoInfo.hasFormats === false 
                                                ? 'Veuillez patienter pendant que nous chargeons les options de téléchargement'
                                                : 'Vérifiez que la vidéo n\'est pas restreinte'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* Notice après la liste des formats */}
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-start space-x-4">
                                    <div className="text-green-500 text-xl mt-1">✅</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-green-800 dark:text-green-300 mb-2 text-base">
                                            Fichiers garantis fonctionnels
                                        </p>
                                        <p className="text-green-600 dark:text-green-400 text-sm leading-relaxed">
                                            Notre backend Python traite directement les vidéos pour vous fournir des fichiers 
                                            MP4/MP3 de haute qualité compatibles avec tous les lecteurs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
