// Détection automatique de l'environnement
const isProduction = window.location.hostname === 'apps.franceparebrise.saint-gobain.com';

export const API_CONFIG = {
  baseUrl: isProduction ? '/assur-api' : 'http://10.128.171.166:3000',
  uploadsUrl: isProduction ? '/assur-uploads' : 'http://10.128.171.166:8080/AssurServer/uploads'
};
