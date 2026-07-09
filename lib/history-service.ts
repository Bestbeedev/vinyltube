'use client';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  format: 'video' | 'audio';
  quality: string;
  size: string;
  duration?: number;
  thumbnail?: string;
  downloadedAt: string;
  collectionId?: string;
}

class HistoryService {
  private static readonly STORAGE_KEY = 'vinyltube-history';
  private static readonly MAX_ITEMS = 100;

  // Ajouter un élément à l'historique
  static addToHistory(item: Omit<HistoryItem, 'id' | 'downloadedAt'>): void {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        downloadedAt: new Date().toISOString()
      };

      const currentHistory = this.getHistory();
      const updatedHistory = [newItem, ...currentHistory].slice(0, this.MAX_ITEMS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new CustomEvent('vinyltube-history-updated'));
    } catch (error) {
      console.error('Erreur ajout historique:', error);
    }
  }

  // Récupérer l'historique
  static getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  // Vider l'historique
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('vinyltube-history-updated'));
    } catch (error) {
      console.error('Erreur vidage historique:', error);
    }
  }

  // Supprimer un élément spécifique
  static removeItem(id: string): void {
    try {
      const currentHistory = this.getHistory();
      const updatedHistory = currentHistory.filter(item => item.id !== id);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new CustomEvent('vinyltube-history-updated'));
    } catch (error) {
      console.error('Erreur suppression item:', error);
    }
  }

  // Rendre la fonction addToHistory disponible globalement
  static makeGlobal(): void {
    if (typeof window !== 'undefined') {
      (window as { addToHistory?: typeof HistoryService.addToHistory }).addToHistory = this.addToHistory.bind(this);
    }
  }
}

export default HistoryService;
export type { HistoryItem };
