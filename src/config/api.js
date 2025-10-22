// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://chatbot-webs.onrender.com' // Deployed backend URL
    : 'http://localhost:3001');

export default API_BASE_URL;