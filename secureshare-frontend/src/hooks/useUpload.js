import { useState } from 'react';
import toast from 'react-hot-toast';
import { fileApi } from '../api/fileApi';
export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadFile = async ({ file, folderId = 'root' }) => {
    setIsUploading(true); setProgress(0);
    try {
      const uploadSession = await fileApi.createUploadUrl({ fileName: file.name, fileSizeBytes: file.size, mimeType: file.type || 'application/octet-stream', parentFolderId: folderId });
      await fileApi.uploadToS3({ uploadUrl: uploadSession.uploadUrl, file, contentType: file.type, onUploadProgress: (event) => { if (event.total) setProgress(Math.round((event.loaded * 100) / event.total)); } });
      await fileApi.completeUpload({ fileId: uploadSession.fileId, uploadId: uploadSession.uploadId, s3Key: uploadSession.s3Key });
      toast.success('File uploaded successfully');
      return uploadSession;
    } catch (error) { toast.error(error.message || 'Upload failed'); throw error; }
    finally { setIsUploading(false); }
  };
  return { uploadFile, progress, isUploading };
}
