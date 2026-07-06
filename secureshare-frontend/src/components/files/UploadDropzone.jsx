import { useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import Button from '../common/Button';
export default function UploadDropzone({ onFileSelected, isUploading, progress }) {
  const inputRef = useRef(null);
  const handleFileChange = (event) => { const file = event.target.files?.[0]; if (file) onFileSelected(file); };
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><UploadCloud className="mx-auto h-12 w-12 text-brand-600" /><h3 className="mt-3 text-lg font-semibold text-slate-900">Upload file</h3><p className="mt-1 text-sm text-slate-500">Large files upload directly to S3 using a pre-signed URL.</p><input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} /><Button className="mt-5" onClick={() => inputRef.current?.click()} isLoading={isUploading}>Choose File</Button>{isUploading && <div className="mt-5"><div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-slate-600">Uploading... {progress}%</p></div>}</div>;
}
