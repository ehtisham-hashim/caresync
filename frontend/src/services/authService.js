import api, { setAccessToken } from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    const { accessToken } = response.data.data;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    const { accessToken } = response.data.data;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      setAccessToken(null);
    }
  }
};
