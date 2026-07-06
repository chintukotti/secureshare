import axios from 'axios';
import axiosClient from './axiosClient';
export const fileApi = {
  listItems: ({ folderId = 'root', search = '', sort = 'updatedAt_desc' } = {}) => axiosClient.get('/folders/' + folderId + '/items', { params: { search, sort } }),
  createUploadUrl: (payload) => axiosClient.post('/files/upload-url', payload),
  uploadToS3: ({ uploadUrl, file, contentType, onUploadProgress }) => axios.put(uploadUrl, file, { headers: { 'Content-Type': contentType || file.type || 'application/octet-stream' }, onUploadProgress }),
  completeUpload: (payload) => axiosClient.post('/files/complete-upload', payload),
  getFile: (fileId) => axiosClient.get(`/files/${fileId}`),
  getDownloadUrl: (fileId) => axiosClient.get(`/files/${fileId}/download-url`),
  renameFile: (fileId, payload) => axiosClient.patch(`/files/${fileId}`, payload),
  deleteFile: (fileId) => axiosClient.delete(`/files/${fileId}`),
  copyFile: (fileId, payload) => axiosClient.post(`/files/${fileId}/copy`, payload),
  moveFile: (fileId, payload) => axiosClient.post(`/files/${fileId}/move`, payload),
  favoriteFile: (fileId) => axiosClient.post(`/files/${fileId}/favorite`),
  unfavoriteFile: (fileId) => axiosClient.delete(`/files/${fileId}/favorite`),
  listTrash: () => axiosClient.get('/trash'),
  restoreFromTrash: (itemId) => axiosClient.post(`/trash/${itemId}/restore`),
  permanentlyDelete: (itemId) => axiosClient.delete(`/trash/${itemId}/permanent`),
};
