import axiosClient from './axiosClient';
export const profileApi = { updateProfile: (payload) => axiosClient.patch('/profile', payload) };
