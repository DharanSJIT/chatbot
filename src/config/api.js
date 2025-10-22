// API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.com' // Replace with your deployed backend URL
  : 'http://localhost:3001';

export default API_BASE_URL;