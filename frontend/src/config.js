const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction 
  ? window.location.origin 
  : 'http://127.0.0.1:8080';

export const WS_BASE_URL = isProduction
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
  : 'ws://127.0.0.1:8080';

export default {
  API_BASE_URL,
  WS_BASE_URL
};
