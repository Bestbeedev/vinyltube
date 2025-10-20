'use client';

import { useState } from 'react';
import { Download, ClipboardPaste, Video, AudioLinesIcon, Clock, User, HardDrive, Sparkles, Zap } from 'lucide-react';
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
    const { loading, videoInfo, progress, extractVideoInfo, downloadVideo } = useDownloadVideo();

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
                            className="w-full px-6 py-7 bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-lg shadow-sm backdrop-blur-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-green-600 disabled:to-green-700 disabled:cursor-not-allowed rounded-2xl font-semibold text-white transition-all flex items-center justify-center space-x-3 min-w-[160px] shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="sm:inline ">Extraction...</span>
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
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        🔒 Traitement sécurisé et privé
                    </p>
                </div>
            </form>

            {/* === DIALOG AMÉLIORÉ === */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-amber-500" />
                            Options de téléchargement
                        </DialogTitle>
                        <DialogDescription>
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
                            <Card className="overflow-hidden  border-2 border-amber-100 dark:border-amber-900/50">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        <img
                                            src={videoInfo.thumbnail}
                                            alt="Miniature"
                                            className="w-full md:w-48 h-32 object-cover"
                                        />
                                        <div className="p-4 flex-1">
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                                {videoInfo.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {videoInfo.author}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDuration(videoInfo.duration)}
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
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50">
                                    <CardContent className="p-3">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {videoInfo.formats?.length || 0}
                                        </div>
                                        <div className="text-xs text-amber-700 dark:text-amber-300">Formats</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50">
                                    <CardContent className="p-3">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {videoInfo.formats?.filter(f => f.hasVideo).length || 0}
                                        </div>
                                        <div className="text-xs text-blue-700 dark:text-blue-300">Vidéos</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                                    <CardContent className="p-3">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {videoInfo.formats?.filter(f => !f.hasVideo).length || 0}
                                        </div>
                                        <div className="text-xs text-green-700 dark:text-green-300">Audios</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Liste des formats */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Formats disponibles ({videoInfo.formats?.length || 0})
                                </h4>

                                {videoInfo.formats && videoInfo.formats.length > 0 ? (
                                    <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                                        {videoInfo.formats
                                            .sort((a, b) => {
                                                if (a.hasVideo && !b.hasVideo) return -1;
                                                if (!a.hasVideo && b.hasVideo) return 1;
                                                return (b.quality || '').localeCompare(a.quality || '');
                                            })
                                            .map((format, index) => (
                                                <Card
                                                    key={index}
                                                    className="cursor-pointer transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 group"
                                                    onClick={() => downloadVideo(videoInfo.url, format.itag.toString(), format.quality)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
                                                                    {getFormatIcon(format.hasAudio, format.hasVideo)}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold">
                                                                            {format.quality || 'Audio'}
                                                                        </span>
                                                                        <Badge className={`text-xs ${getQualityColor(format.quality)}`}>
                                                                            {format.container}
                                                                        </Badge>
                                                                    </div>
                                                                    {/* <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-4 mt-1">
                                                                        <span className="flex items-center gap-1">
                                                                            <HardDrive className="w-3 h-3" />
                                                                            {getFileSizeEstimate(format.quality, format.hasAudio, format.hasVideo)}
                                                                        </span>
                                                                        {format.audioCodec && (
                                                                            <span>Audio: {format.audioCodec}</span>
                                                                        )}
                                                                    </div> */}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-amber-500 hover:bg-amber-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Empêcher le déclenchement du parent
                                                                    downloadVideo(videoInfo.url, format.itag.toString(), format.quality);
                                                                }}
                                                            >
                                                                <Download className="w-4 h-4 mr-1" />
                                                                Télécharger
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Aucun format disponible</p>
                                        <p className="text-sm">Vérifiez que la vidéo n'est pas restreinte</p>
                                    </div>
                                )}
                            </div>
                            {/* Nitices  après la liste des formats */}
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start space-x-3">
                                    <div className="text-green-500 mt-0.5">✅</div>
                                    <div className="text-sm flex-1">
                                        <p className="font-medium text-green-800 dark:text-green-300 mb-1">
                                            Fichiers garantis fonctionnels
                                        </p>
                                        <p className="text-green-600 dark:text-green-400 text-xs">
                                            Nous utilisons <strong>SaveFrom.net</strong> pour la vidéo et <strong>YTMP3</strong> pour l'audio.
                                            Ces services fournissent des fichiers MP4/MP3 de haute qualité compatibles avec tous les lecteurs.
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
