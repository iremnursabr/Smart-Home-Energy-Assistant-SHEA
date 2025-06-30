import axios from 'axios';

// API base URL 
export const API_BASE_URL = 'http://localhost:5000/api';

// Mock servis kullanımını kontrol eder - kalıcı olarak devre dışı bırakıldı
export const USE_MOCK_SERVICES = false;

// Axios örnekleme
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Cookie'lerin gönderilmesini sağlar (session için gerekli)
});

// İstek interceptor
api.interceptors.request.use(
  (config) => {
    // Session based authentication kullanıldığı için token eklemek gerekmiyor
    // withCredentials: true zaten cookie'leri otomatik olarak gönderiyor
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      console.error(`API Error Status: ${error.response.status}`, error.response.data);
      
      // Oturum sonlandı
      if (error.response.status === 401) {
        // Session based auth kullanıldığından token silmeye gerek yok
        console.log('Unauthorized, redirecting to login');
        window.location.href = '/login';
      }
      
      // Server error
      if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }
      
      // Not found error
      if (error.response.status === 404) {
        console.error('Endpoint not found:', error.config.url);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 