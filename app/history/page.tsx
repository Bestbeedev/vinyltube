'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Trash2, Download, Video, AudioLines, Clock,
  Calendar, Grid3X3, List, HardDrive, ExternalLink, GalleryVerticalEnd
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeProvider } from 'next-themes';
import ThemeToggle from '@/components/partials/theme-toggle';
import HistoryService, { HistoryItem } from '@/lib/history-service';

const itemVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

type SortKey = 'date' | 'title' | 'size';

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function parseSizeMB(size: string): number {
  const n = parseFloat(size);
  return isNaN(n) ? 0 : n;
}

function HistoryPageContent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<'all' | 'video' | 'audio'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const load = () => setHistory(HistoryService.getHistory());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const clearHistory = () => {
    HistoryService.clearHistory();
    setHistory([]);
    setShowClearModal(false);
  };

  const deleteItem = (id: string) => {
    HistoryService.removeItem(id);
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const filtered = history
    .filter(item => {
      const q = searchQuery.toLowerCase();
      return (
        (item.title.toLowerCase().includes(q) || item.quality.toLowerCase().includes(q)) &&
        (filterFormat === 'all' || item.format === filterFormat)
      );
    })
    .sort((a, b) => {
      if (sortKey === 'date') return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'size') return parseSizeMB(b.size) - parseSizeMB(a.size);
      return 0;
    });

  // Stats
  const totalVideo = history.filter(i => i.format === 'video').length;
  const totalAudio = history.filter(i => i.format === 'audio').length;
  const totalSizeMB = history.reduce((acc, i) => acc + parseSizeMB(i.size), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100/80 dark:from-neutral-900 dark:via-amber-900/5 dark:to-neutral-800/95 text-neutral-900 dark:text-neutral-100">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div onClick={() => window.location.href = '/'} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="p-2 bg-amber-100/80 dark:bg-amber-900/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                <GalleryVerticalEnd className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xl font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                VynilTube
              </span>
            </div>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <h1 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">Historique</h1>
            <Badge variant="secondary">{history.length} téléchargements</Badge>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowClearModal(true)}
                className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300">
                <Trash2 className="w-4 h-4 mr-1" /> Vider
              </Button>
            )}
            <div className="flex bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm"
                onClick={() => setViewMode('grid')} className="rounded-r-none">
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm"
                onClick={() => setViewMode('list')} className="rounded-l-none">
                <List className="w-4 h-4" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: history.length, icon: Download, color: 'text-amber-500' },
              { label: 'Vidéos', value: totalVideo, icon: Video, color: 'text-blue-500' },
              { label: 'Audios', value: totalAudio, icon: AudioLines, color: 'text-green-500' },
              { label: 'Taille totale', value: `${totalSizeMB.toFixed(0)} MB`, icon: HardDrive, color: 'text-purple-500' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white/70 dark:bg-neutral-800/70 rounded-xl border border-neutral-100 dark:border-neutral-700">
                <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
                <div>
                  <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{s.value}</div>
                  <div className="text-xs text-neutral-500">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-neutral-800/80 rounded-xl border-neutral-200/60 dark:border-neutral-700/60 focus:border-amber-400 dark:focus:border-amber-500" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filtre format */}
            <div className="flex bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              {(['all', 'video', 'audio'] as const).map(f => (
                <Button key={f} variant={filterFormat === f ? 'default' : 'ghost'} size="sm"
                  onClick={() => setFilterFormat(f)}
                  className={f === 'all' ? 'rounded-r-none' : f === 'audio' ? 'rounded-l-none' : 'rounded-none'}>
                  {f === 'all' ? 'Tous' : f === 'video' ? <><Video className="w-3 h-3 mr-1" />Vidéo</> : <><AudioLines className="w-3 h-3 mr-1" />Audio</>}
                </Button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              {([['date', 'Date'], ['title', 'Titre'], ['size', 'Taille']] as [SortKey, string][]).map(([key, label], i, arr) => (
                <Button key={key} variant={sortKey === key ? 'default' : 'ghost'} size="sm"
                  onClick={() => setSortKey(key)}
                  className={i === 0 ? 'rounded-r-none' : i === arr.length - 1 ? 'rounded-l-none' : 'rounded-none'}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Résultats */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Clock className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {searchQuery || filterFormat !== 'all' ? 'Aucun résultat' : 'Aucun historique'}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto text-sm">
              {searchQuery || filterFormat !== 'all'
                ? 'Essayez une autre recherche ou modifiez les filtres.'
                : 'Vos téléchargements apparaîtront ici automatiquement.'}
            </p>
            {history.length === 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 max-w-sm mx-auto">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  💡 Téléchargez une vidéo depuis la <a href="/" className="underline font-medium">page d'accueil</a> pour commencer.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate"
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'}>
            {filtered.map(item => (
              <motion.div key={item.id} variants={itemVariant} whileHover={{ scale: 1.01 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {viewMode === 'grid' ? (
                  <GridCard item={item} onDelete={deleteItem} />
                ) : (
                  <ListCard item={item} onDelete={deleteItem} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal confirmation */}
      {showClearModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowClearModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-700"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Vider l'historique</h3>
                <p className="text-sm text-neutral-500">{history.length} entrées seront supprimées.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowClearModal(false)}>Annuler</Button>
              <Button onClick={clearHistory} className="bg-red-500 hover:bg-red-600 text-white">Vider tout</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function GridCard({ item, onDelete }: { item: HistoryItem; onDelete: (id: string) => void }) {
  return (
    <div className="group bg-white/90 dark:bg-neutral-800/90 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-36 bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.format === 'video'
              ? <Video className="w-10 h-10 text-neutral-300 dark:text-neutral-500" />
              : <AudioLines className="w-10 h-10 text-neutral-300 dark:text-neutral-500" />}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge className={`text-xs ${item.format === 'video' ? 'bg-blue-500' : 'bg-green-500'} text-white border-0`}>
            {item.format === 'video' ? 'MP4' : 'MP3'}
          </Badge>
        </div>
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Ouvrir la source">
            <ExternalLink className="w-4 h-4 text-neutral-700" />
          </a>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
            className="p-2 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors" title="Supprimer">
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2 mb-2">{item.title}</h3>
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{item.quality}</Badge>
            {item.size !== 'N/A' && (
              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{item.size}</span>
            )}
          </div>
          {formatDuration(item.duration) && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(item.duration)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
          <Calendar className="w-3 h-3" />
          {formatDate(item.downloadedAt)}
        </div>
      </div>
    </div>
  );
}

function ListCard({ item, onDelete }: { item: HistoryItem; onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-4 p-4 bg-white/90 dark:bg-neutral-800/90 rounded-xl border border-neutral-100 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div className="w-20 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.format === 'video'
              ? <Video className="w-5 h-5 text-neutral-400" />
              : <AudioLines className="w-5 h-5 text-neutral-400" />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">{item.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Badge className={`text-xs ${item.format === 'video' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'} border-0`}>
            {item.format === 'video' ? 'MP4' : 'MP3'}
          </Badge>
          <span>{item.quality}</span>
          {item.size !== 'N/A' && <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{item.size}</span>}
          {formatDuration(item.duration) && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(item.duration)}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.downloadedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" title="Ouvrir la source">
          <ExternalLink className="w-4 h-4 text-neutral-500" />
        </a>
        <button onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Supprimer">
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HistoryPageContent />
    </ThemeProvider>
  );
}
