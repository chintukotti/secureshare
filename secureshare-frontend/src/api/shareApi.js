import axiosClient from './axiosClient';
export const shareApi = {
  createShareLink: (payload) => axiosClient.post('/shares', payload),
  listShares: () => axiosClient.get('/shares'),
  getShare: (shareId) => axiosClient.get(`/shares/${shareId}`),
  updateShare: (shareId, payload) => axiosClient.patch(`/shares/${shareId}`, payload),
  revokeShare: (shareId) => axiosClient.delete(`/shares/${shareId}`),
  getPublicShare: (shareToken) => axiosClient.get(`/public/shares/${shareToken}`),
  verifyPassword: (shareToken, payload) => axiosClient.post(`/public/shares/${shareToken}/verify-password`, payload),
  getPublicDownloadUrl: (shareToken, payload = {}) => axiosClient.post(`/public/shares/${shareToken}/download`, payload),
};
