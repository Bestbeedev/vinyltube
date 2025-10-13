'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useDownloadVideo } from '@/hooks/useDownloadVideo';

export default function VideoForm() {
    const [url, setUrl] = useState('');
    const [open, setOpen] = useState(false);
    const { loading, videoInfo, progress, extractVideoInfo, downloadVideo } = useDownloadVideo();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        const success = await extractVideoInfo(url);
        if (success) setOpen(true); // ouvre le modal uniquement si extraction OK
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
                            required
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
                                <span className="sm:inline hidden">Extraction...</span>
                            </div>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                <span className="sm:inline hidden">Extraire</span>
                                <span className="sm:hidden inline">Go</span>
                            </>
                        )}
                    </Button>
                </div>
                <div className="text-center mt-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        🔒 Traitement sécurisé et privé
                    </p>
                </div>
            </form>

            {/* === DIALOG DES INFOS VIDEO === */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Informations de la vidéo</DialogTitle>
                    </DialogHeader>

                    {loading && <Progress value={progress} />}

                    {videoInfo ? (
                        <div className="space-y-3">
                            <img
                                src={videoInfo.thumbnail}
                                alt="thumbnail"
                                className="rounded-xl w-full object-cover"
                            />
                            <h2 className="text-lg font-semibold">{videoInfo.title}</h2>

                            <div className="grid gap-2">
                                {videoInfo.formats.map((f: any, i: number) => (
                                    <Button
                                        key={i}
                                        onClick={() => downloadVideo(url, f.quality)}
                                        variant="secondary"
                                        className="justify-between"
                                    >
                                        {f.quality} • {f.container}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                            <div className="flex dark:bg-neutral-800 bg-neutral-100 text-center mt-3 p-8 rounded-md items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                <span className="sm:inline hidden">Analyse en cours...</span>
                            </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
