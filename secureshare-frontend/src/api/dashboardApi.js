import axiosClient from './axiosClient';
export const dashboardApi = {
  getSummary: () => axiosClient.get('/dashboard/summary'),
  getRecentUploads: () => axiosClient.get('/dashboard/recent-uploads'),
  getRecentDownloads: () => axiosClient.get('/dashboard/recent-downloads'),
};
