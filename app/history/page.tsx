'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Download, Video, AudioLines, Clock, Calendar, Filter, Grid3X3, List, HardDrive, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeProvider } from "next-themes";
import ThemeToggle from '@/components/partials/theme-toggle';
import HistoryService, { HistoryItem } from '@/lib/history-service';

const staggerContainer = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

function HistoryPageContent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<'all' | 'video' | 'audio'>('all');
  const [showClearModal, setShowClearModal] = useState(false);

  // Charger l'historique depuis localStorage via le service
  useEffect(() => {
    const loadHistory = () => {
      const history = HistoryService.getHistory();
      setHistory(history);
    };

    loadHistory();

    // Écouter les changements de storage pour synchroniser
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vinyltube-history') {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Ajouter un élément à l'historique (appelé depuis VideoForm)
  const clearHistory = () => {
    HistoryService.clearHistory();
    setHistory([]);
    setShowClearModal(false);
  };

  const deleteItem = (id: string) => {
    HistoryService.removeItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const openFileLocally = (item: HistoryItem) => {
    // Essayer d'ouvrir le fichier dans l'explorateur
    // Note: Les fichiers téléchargés sont généralement dans le dossier Downloads
    const filename = `${item.title.replace(/[^\w\s-]/gi, '')}_${item.quality}.${item.format === 'video' ? 'mp4' : 'mp3'}`;
    
    // Créer un lien temporaire pour simuler l'ouverture
    const link = document.createElement('a');
    link.href = '#'; // Placeholder - dans une vraie implémentation, on chercherait le fichier local
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Message informatif
    alert(`📁 Cherchez "${filename}" dans votre dossier de téléchargement`);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.quality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = filterFormat === 'all' || item.format === filterFormat;
    return matchesSearch && matchesFormat;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100/80 dark:from-neutral-900 dark:via-amber-900/5 dark:to-neutral-800/95">
      <div className="text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-12">
              {/* Logo cliquable vers accueil */}
              <div 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="p-1 sm:p-2 bg-amber-100/80 dark:bg-amber-900/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg sm:text-2xl font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                    VynilTube
                  </span>
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium -mt-1">
                    préserver l'essentiel
                  </div>
                </div>
              </div>
              
              <h1 className="text-lg sm:text-2xl font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                Historique
              </h1>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {history.length} téléchargements
              </Badge>
              <Badge variant="outline" className="text-xs text-neutral-500">
                Stockage local
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Bouton vider historique */}
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearModal(true)}
                  className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 text-xs sm:text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Vider</span>
                </Button>
              )}
              
              {/* Mode d'affichage */}
              <div className="flex items-center bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none text-xs sm:text-sm"
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none text-xs sm:text-sm"
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex  sm:flex-row gap-4 mb-8 px-4"
        >
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans l'historique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-all w-full"
            />
          </div>
          
          {/* Filtre format */}
          <div className="flex items-center bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <Button
              variant={filterFormat === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterFormat('all')}
              className="rounded-r-none text-xs sm:text-sm"
            >
              Tous
            </Button>
            <Button
              variant={filterFormat === 'video' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterFormat('video')}
              className="rounded-none text-xs sm:text-sm"
            >
              <Video className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Vidéo</span>
            </Button>
            <Button
              variant={filterFormat === 'audio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterFormat('audio')}
              className="rounded-l-none text-xs sm:text-sm"
            >
              <AudioLines className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Audio</span>
            </Button>
          </div>
        </motion.div>

        {/* Historique Grid/List */}
        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20 px-4"
          >
            <Clock className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {searchQuery || filterFormat !== 'all' ? 'Aucun résultat' : 'Aucun historique'}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              {searchQuery || filterFormat !== 'all'
                ? 'Essayez une autre recherche ou modifiez les filtres.'
                : 'Vos téléchargements apparaîtront ici automatiquement.'
              }
            </p>
            {history.length === 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 max-w-md mx-auto">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  💡 Les téléchargements sont sauvegardés localement dans votre navigateur.
                  <br />
                  <span className="text-xs">Effacez vos données de navigation pour supprimer cet historique.</span>
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              : "space-y-4"
            }
          >
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
                className={viewMode === 'grid' ? '' : 'mb-4'}
              >
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                      onClick={() => openFileLocally(item)}
                    >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.format === 'video' ? (
                            <Video className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <AudioLines className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-xs md:text-sm lg:text-base font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                            {item.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.quality}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.format}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Métadonnées */}
                    <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{item.size}</span>
                        </div>
                        {item.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(item.downloadedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de confirmation suppression */}
      {showClearModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowClearModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                  Vider l'historique
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Cette action supprimera définitivement les {history.length} téléchargements enregistrés.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowClearModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={clearHistory}
                className="bg-red-500 hover:bg-red-600"
              >
                Vider tout
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
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