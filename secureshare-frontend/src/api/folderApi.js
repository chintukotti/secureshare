import axiosClient from './axiosClient';
export const folderApi = {
  createFolder: (payload) => axiosClient.post('/folders', payload),
  renameFolder: (folderId, payload) => axiosClient.patch(`/folders/${folderId}`, payload),
  deleteFolder: (folderId) => axiosClient.delete(`/folders/${folderId}`),
};
