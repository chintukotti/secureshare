import axiosClient from './axiosClient';
export const analyticsApi = {
  getFileAnalytics: (fileId) => axiosClient.get(`/analytics/files/${fileId}`),
  getMostDownloaded: () => axiosClient.get('/analytics/most-downloaded'),
  getDownloadEvents: () => axiosClient.get('/analytics/download-events'),
};
