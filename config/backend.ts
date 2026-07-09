// Configuration du backend Python
export const BACKEND_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
  TIMEOUT: Number(process.env.BACKEND_TIMEOUT) || 300000,
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
