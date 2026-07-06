import axiosClient from './axiosClient';
export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  confirmEmail: (payload) => axiosClient.post('/auth/confirm-email', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  logout: () => axiosClient.post('/auth/logout'),
  forgotPassword: (payload) => axiosClient.post('/auth/forgot-password', payload),
  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),
  changePassword: (payload) => axiosClient.post('/auth/change-password', payload),
  me: () => axiosClient.get('/auth/me'),
};
