import axiosClient from './axiosClient';
export const activityApi = {
  listActivity: () => axiosClient.get('/activity'),
  listFileActivity: (fileId) => axiosClient.get(`/activity/files/${fileId}`),
};
