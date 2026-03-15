// src/config.js

const VITE_API_URL = import.meta.env.VITE_API_URL;

const API_URL = VITE_API_URL 
  ? (VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`)
  : 'http://localhost:5000/api';

const BASE_URL = VITE_API_URL 
  ? VITE_API_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost:5000';

export { API_URL, BASE_URL };
