// Configuration du backend Python
export const BACKEND_CONFIG = {
  // URL du backend Python (à adapter selon ta configuration)
  BASE_URL: 'http://localhost:8000',
  
  // Timeout en millisecondes
  TIMEOUT: 300000, // 5 minutes pour les téléchargements
  
  // Configuration des formats supportés
  SUPPORTED_FORMATS: {
    VIDEO: ['mp4', 'webm', 'mkv'],
    AUDIO: ['mp3', 'wav', 'aac', 'ogg']
  }
} as const;

// Endpoints du backend Python
export const BACKEND_ENDPOINTS = {
  EXTRACT: '/api/extract',
  EXTRACT_FAST: '/api/extract-fast',
  DOWNLOAD: '/api/download',
  HEALTH: '/api/health'
} as const;

// Helper pour construire les URLs complètes
export const getBackendUrl = (endpoint: keyof typeof BACKEND_ENDPOINTS) => {
  return `${BACKEND_CONFIG.BASE_URL}${BACKEND_ENDPOINTS[endpoint]}`;
};
