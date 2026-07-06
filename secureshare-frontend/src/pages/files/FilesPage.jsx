import { useState } from 'react';
import toast from 'react-hot-toast';
import { Folder, FolderInput } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumbs from '../../components/files/Breadcrumbs';
import FileTable from '../../components/files/FileTable';
import FileToolbar from '../../components/files/FileToolbar';
import UploadDropzone from '../../components/files/UploadDropzone';
import { fileApi } from '../../api/fileApi';
import { folderApi } from '../../api/folderApi';
import { shareApi } from '../../api/shareApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useFiles } from '../../hooks/useFiles';
import { useUpload } from '../../hooks/useUpload';

export default function FilesPage() {
  const [folderId, setFolderId] = useState('root');
  const [folderPath, setFolderPath] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updatedAt_desc');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const [renameItem, setRenameItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const [shareItem, setShareItem] = useState(null);
  const [expiryType, setExpiryType] = useState('60');
  const [customValue, setCustomValue] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [isCreatingShare, setIsCreatingShare] = useState(false);

  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [folderActionMode, setFolderActionMode] = useState('move');
  const [folderActionItems, setFolderActionItems] = useState([]);
  const [destinationFolderId, setDestinationFolderId] = useState('root');
  const [destinationPath, setDestinationPath] = useState([]);
  const [destinationFolders, setDestinationFolders] = useState([]);
  const [folderPickerExcludedIds, setFolderPickerExcludedIds] = useState([]);
  const [isFolderPickerLoading, setIsFolderPickerLoading] = useState(false);
  const [isApplyingFolderAction, setIsApplyingFolderAction] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { items, isLoading, reload } = useFiles({ folderId, search: debouncedSearch, sort });
  const { uploadFile, progress, isUploading } = useUpload();

  const selectedItems = items.filter((item) => selectedItemIds.includes(item.itemId));
  const selectedFiles = selectedItems.filter((item) => item.itemType === 'FILE');

  const clearSelection = () => setSelectedItemIds([]);

  const handleOpenFolder = (folder) => {
    setFolderId(folder.itemId);
    setFolderPath((current) => [...current, { id: folder.itemId, name: folder.name }]);
    setSearch('');
    clearSelection();
  };

  const goRoot = () => {
    setFolderId('root');
    setFolderPath([]);
    clearSelection();
  };

  const goFolder = (folder, index) => {
    setFolderId(folder.id);
    setFolderPath((current) => current.slice(0, index + 1));
    clearSelection();
  };

  const handleToggleSelect = (item) => {
    setSelectedItemIds((current) =>
      current.includes(item.itemId)
        ? current.filter((id) => id !== item.itemId)
        : [...current, item.itemId]
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = items.length > 0 && items.every((item) => selectedItemIds.includes(item.itemId));
    setSelectedItemIds(allSelected ? [] : items.map((item) => item.itemId));
  };

  const handleUpload = async (file) => {
    await uploadFile({ file, folderId });
    setIsUploadOpen(false);
    reload();
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return toast.error('Folder name is required');
    try {
      await folderApi.createFolder({ name: folderName.trim(), parentFolderId: folderId });
      toast.success('Folder created');
      setFolderName('');
      setIsFolderOpen(false);
      reload();
    } catch (error) {
      toast.error(error.message || 'Unable to create folder');
    }
  };

  const handleDownload = async (item) => {
    try {
      const response = await fileApi.getDownloadUrl(item.itemId);
      window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error.message || 'Unable to download file');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Move ${item.name} to trash?`)) return;
    try {
      if (item.itemType === 'FOLDER') await folderApi.deleteFolder(item.itemId);
      else await fileApi.deleteFile(item.itemId);
      toast.success('Moved to trash');
      clearSelection();
      reload();
    } catch (error) {
      toast.error(error.message || 'Unable to delete item');
    }
  };

  const handleFavorite = async (item) => {
    try {
      if (item.isFavorite) await fileApi.unfavoriteFile(item.itemId);
      else await fileApi.favoriteFile(item.itemId);
      reload();
    } catch (error) {
      toast.error(error.message || 'Unable to update favorite');
    }
  };

  const openRenameModal = (item) => {
    setRenameItem(item);
    setRenameValue(item.name || '');
  };

  const submitRename = async () => {
    if (!renameValue.trim()) return toast.error('Name is required');
    try {
      if (renameItem.itemType === 'FOLDER') {
        await folderApi.renameFolder(renameItem.itemId, { name: renameValue.trim() });
      } else {
        await fileApi.renameFile(renameItem.itemId, { name: renameValue.trim() });
      }
      toast.success('Renamed successfully');
      setRenameItem(null);
      setRenameValue('');
      reload();
    } catch (error) {
      toast.error(error.message || 'Unable to rename item');
    }
  };

  const moveItemsToRoot = async (actionItems) => {
    if (folderId === 'root') return;
    try {
      await Promise.all(actionItems.map((item) => fileApi.moveFile(item.itemId, { targetFolderId: 'root' })));
      toast.success(actionItems.length > 1 ? 'Items moved to My Files' : 'Moved to My Files');
      clearSelection();
      reload();
    } catch (error) {
      toast.error(error.message || 'Unable to move item');
    }
  };

  const loadDestinationFolders = async (targetFolderId = 'root', targetPath = [], excludedIds = folderPickerExcludedIds) => {
    setIsFolderPickerLoading(true);
    try {
      const response = await fileApi.listItems({ folderId: targetFolderId, search: '', sort: 'name_asc' });
      const excluded = new Set(excludedIds);
      const folders = (response.items || []).filter((item) => item.itemType === 'FOLDER' && !excluded.has(item.itemId));
      setDestinationFolderId(targetFolderId);
      setDestinationPath(targetPath);
      setDestinationFolders(folders);
    } catch (error) {
      toast.error(error.message || 'Unable to load folders');
    } finally {
      setIsFolderPickerLoading(false);
    }
  };

  const openFolderPicker = async (mode, actionItems) => {
    const normalizedItems = Array.isArray(actionItems) ? actionItems : [actionItems];
    if (!normalizedItems.length) return toast.error('Select at least one item');

    if (mode === 'copy' && !normalizedItems.some((item) => item.itemType === 'FILE')) {
      return toast.error('Only files can be copied. Please select at least one file.');
    }

    const excludedIds = normalizedItems.map((item) => item.itemId);
    setFolderActionMode(mode);
    setFolderActionItems(normalizedItems);
    setFolderPickerExcludedIds(excludedIds);
    setDestinationFolderId('root');
    setDestinationPath([]);
    setDestinationFolders([]);
    setIsFolderPickerOpen(true);
    await loadDestinationFolders('root', [], excludedIds);
  };

  const openDestinationFolder = async (folder) => {
    await loadDestinationFolders(folder.itemId, [...destinationPath, { id: folder.itemId, name: folder.name }]);
  };

  const goDestinationRoot = async () => {
    await loadDestinationFolders('root', []);
  };

  const goDestinationPathFolder = async (folder, index) => {
    await loadDestinationFolders(folder.id, destinationPath.slice(0, index + 1));
  };

  const applyFolderAction = async () => {
    setIsApplyingFolderAction(true);
    try {
      if (folderActionMode === 'move') {
        await Promise.all(folderActionItems.map((item) => fileApi.moveFile(item.itemId, { targetFolderId: destinationFolderId })));
        toast.success(folderActionItems.length > 1 ? 'Items moved successfully' : 'Item moved successfully');
      } else {
        const filesToCopy = folderActionItems.filter((item) => item.itemType === 'FILE');
        await Promise.all(filesToCopy.map((item) => fileApi.copyFile(item.itemId, { targetFolderId: destinationFolderId })));
        toast.success(filesToCopy.length > 1 ? 'Files copied successfully' : 'File copied successfully');
      }

      setIsFolderPickerOpen(false);
      setFolderActionItems([]);
      clearSelection();
      reload();
    } catch (error) {
      toast.error(error.message || `Unable to ${folderActionMode} item`);
    } finally {
      setIsApplyingFolderAction(false);
    }
  };

  const openShareModal = (item) => {
    setShareItem(item);
    setExpiryType('60');
    setCustomValue('');
    setIsOneTime(false);
    setSharePassword('');
    setGeneratedShareUrl('');
  };

  const calculateExpiryMinutes = () => {
    if (expiryType === 'no_limit') return null;
    if (expiryType === 'custom_hours') return Math.max(1, Number(customValue || 1)) * 60;
    if (expiryType === 'custom_days') return Math.max(1, Number(customValue || 1)) * 24 * 60;
    return Number(expiryType);
  };
  const copyTextToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = document.createElement('textarea');
      textArea.value = text;

      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch {
      return false;
    }
  };

  const createShareLink = async () => {
    if (!shareItem) return;
    const expiresInMinutes = calculateExpiryMinutes();

    setIsCreatingShare(true);
    try {
      const response = await shareApi.createShareLink({
        fileId: shareItem.itemId,
        expiresInMinutes,
        noExpiry: expiryType === 'no_limit',
        isOneTime,
        visibility: 'PUBLIC',
        password: sharePassword.trim() || undefined,
      });
    setGeneratedShareUrl(response.shareUrl);

    const copied = await copyTextToClipboard(response.shareUrl);

    if (copied) {
      toast.success('Share link created and copied');
    } else {
      toast.success('Share link created. Please copy it manually.');
    }
    } catch (error) {
      toast.error(error.message || 'Unable to create share link');
    } finally {
      setIsCreatingShare(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Files" description="Upload, organize, download, share, and manage files stored securely in S3." />

      <Breadcrumbs folders={folderPath} onNavigateRoot={goRoot} onNavigateFolder={goFolder} />

      <FileToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        onUploadClick={() => setIsUploadOpen(true)}
        onCreateFolderClick={() => setIsFolderOpen(true)}
      />

      {selectedItems.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-brand-900">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => openFolderPicker('move', selectedItems)}>Move to Folder</Button>
            <Button variant="secondary" onClick={() => openFolderPicker('copy', selectedFiles)} disabled={!selectedFiles.length}>Copy Files to Folder</Button>
            {folderId !== 'root' && <Button variant="secondary" onClick={() => moveItemsToRoot(selectedItems)}>Move to My Files</Button>}
            <Button variant="ghost" onClick={clearSelection}>Clear</Button>
          </div>
        </div>
      )}

      <FileTable
        items={items}
        isLoading={isLoading}
        currentFolderId={folderId}
        selectedItemIds={selectedItemIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenFolder={handleOpenFolder}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onFavorite={handleFavorite}
        onShare={openShareModal}
        onRename={openRenameModal}
        onMoveToRoot={(item) => moveItemsToRoot([item])}
        onMoveToFolder={(item) => openFolderPicker('move', item)}
        onCopyToFolder={(item) => openFolderPicker('copy', item)}
      />

      <Modal isOpen={isUploadOpen} title={`Upload file${folderPath.length ? ` to ${folderPath[folderPath.length - 1].name}` : ''}`} onClose={() => setIsUploadOpen(false)}>
        <UploadDropzone onFileSelected={handleUpload} isUploading={isUploading} progress={progress} />
      </Modal>

      <Modal isOpen={isFolderOpen} title="Create folder" onClose={() => setIsFolderOpen(false)}>
        <div className="space-y-4">
          <Input label="Folder name" value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Example: Assignments" />
          <Button onClick={handleCreateFolder}>Create Folder</Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(renameItem)} title="Rename item" onClose={() => setRenameItem(null)}>
        <div className="space-y-4">
          <Input label="New name" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
          <Button onClick={submitRename}>Save Name</Button>
        </div>
      </Modal>

      <Modal isOpen={isFolderPickerOpen} title={folderActionMode === 'move' ? 'Move to folder' : 'Copy to folder'} onClose={() => setIsFolderPickerOpen(false)}>
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-900">
              {folderActionMode === 'move' ? 'Moving' : 'Copying'} {folderActionItems.length} item{folderActionItems.length > 1 ? 's' : ''}
            </p>
            <p className="mt-1 text-slate-500">
              Destination: My Files{destinationPath.map((folder) => ` / ${folder.name}`).join('')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button onClick={goDestinationRoot} className="rounded-lg px-2 py-1 font-medium text-brand-700 hover:bg-brand-50">My Files</button>
            {destinationPath.map((folder, index) => (
              <span key={folder.id} className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                <button onClick={() => goDestinationPathFolder(folder, index)} className="rounded-lg px-2 py-1 font-medium text-brand-700 hover:bg-brand-50">{folder.name}</button>
              </span>
            ))}
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
            {isFolderPickerLoading ? (
              <p className="p-3 text-sm text-slate-500">Loading folders...</p>
            ) : destinationFolders.length ? (
              destinationFolders.map((folder) => (
                <button
                  key={folder.itemId}
                  onClick={() => openDestinationFolder(folder)}
                  className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Folder className="h-5 w-5 shrink-0 text-amber-500" />
                    <span className="truncate font-medium text-slate-800">{folder.name}</span>
                  </span>
                  <span className="text-xs text-slate-400">Open</span>
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-slate-500">No folders inside this location. You can still choose this destination.</p>
            )}
          </div>

          <Button onClick={applyFolderAction} isLoading={isApplyingFolderAction} className="w-full gap-2">
            <FolderInput className="h-4 w-4" />
            {folderActionMode === 'move' ? 'Move here' : 'Copy here'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(shareItem)} title="Share file" onClose={() => setShareItem(null)}>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">File</p>
            <p className="font-semibold text-slate-900">{shareItem?.name}</p>
          </div>

          <label className="block">
            <span className="form-label">Expiry time</span>
            <select
              value={expiryType}
              onChange={(event) => setExpiryType(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="60">1 hour</option>
              <option value="1440">24 hours</option>
              <option value="10080">7 days</option>
              <option value="no_limit">No limit</option>
              <option value="custom_hours">Custom hours</option>
              <option value="custom_days">Custom days</option>
            </select>
          </label>

          {(expiryType === 'custom_hours' || expiryType === 'custom_days') && (
            <Input
              label={expiryType === 'custom_hours' ? 'Number of hours' : 'Number of days'}
              type="number"
              min="1"
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
              placeholder="Example: 3"
            />
          )}

          <Input
            label="Password protection optional"
            type="password"
            value={sharePassword}
            onChange={(event) => setSharePassword(event.target.value)}
            placeholder="Leave empty for no password"
          />

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
            <input type="checkbox" checked={isOneTime} onChange={(event) => setIsOneTime(event.target.checked)} />
            <span>
              <span className="font-medium text-slate-900">One-time download</span>
              <span className="block text-slate-500">Expire the link after the first successful download.</span>
            </span>
          </label>

          <Button onClick={createShareLink} isLoading={isCreatingShare} className="w-full">Create Share Link</Button>

          {generatedShareUrl && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Generated link</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input readOnly value={generatedShareUrl} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const copied = await copyTextToClipboard(generatedShareUrl);

                    if (copied) {
                      toast.success('Copied');
                    } else {
                      toast.error('Copy failed. Please select the link and copy manually.');
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
