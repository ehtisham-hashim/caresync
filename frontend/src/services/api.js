import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Store access token in memory
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => accessToken;

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for handling 401s and refreshing tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept requests to login/register or refresh itself
      if (originalRequest.url.includes('/auth/login') || 
          originalRequest.url.includes('/auth/register') ||
          originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using the HTTP-only cookie
        const { data } = await api.post('/auth/refresh');
        const { accessToken } = data.data;

        // If you are using bearer tokens in headers globally:
        setAccessToken(accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Dispatch event or call store to handle logout if refresh fails
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
