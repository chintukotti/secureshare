import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Copy,
  Download,
  Edit3,
  File,
  Folder,
  FolderInput,
  Heart,
  Link2,
  MoveRight,
  MoreVertical,
  Trash2,
} from 'lucide-react';

import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

import { formatBytes } from '../../utils/formatBytes';
import { formatDateTime } from '../../utils/formatDate';

export default function FileTable({
  items,
  isLoading,
  currentFolderId = 'root',
  selectedItemIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onOpenFolder,
  onDownload,
  onDelete,
  onFavorite,
  onShare,
  onRename,
  onMoveToRoot,
  onMoveToFolder,
  onCopyToFolder,
}) {
  const [openMenu, setOpenMenu] = useState(null);

  const selectedSet = new Set(selectedItemIds);
  const allSelected = items.length > 0 && items.every((item) => selectedSet.has(item.itemId));

  const activeItem = openMenu
    ? items.find((item) => item.itemId === openMenu.itemId)
    : null;

  const activeIsFolder = activeItem?.itemType === 'FOLDER';

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <LoadingSpinner label="Loading files..." />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No files found"
        description="Upload files or create folders to start using SecureShare."
      />
    );
  }

  const getMenuHeight = (item) => {
    let count = 2;

    if (item.itemType !== 'FOLDER') count += 2;
    if (currentFolderId !== 'root') count += 1;

    return count * 42 + 16;
  };

  const handleOpenMenu = (event, item) => {
    event.stopPropagation();

    if (openMenu?.itemId === item.itemId) {
      setOpenMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const menuWidth = 224;
    const menuHeight = getMenuHeight(item);
    const gap = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUp = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = shouldOpenUp
      ? Math.max(gap, rect.top - menuHeight - gap)
      : Math.max(gap, Math.min(rect.bottom + gap, window.innerHeight - menuHeight - gap));

    const left = Math.max(
      gap,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - gap)
    );

    setOpenMenu({
      itemId: item.itemId,
      top,
      left,
    });
  };

  const runAction = (callback, item) => {
    setOpenMenu(null);
    callback?.(item);
  };

  const menuItemClass =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950';

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[52px] px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    aria-label="Select all items"
                  />
                </th>

                <th className="w-[34%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>

                <th className="w-[110px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Size
                </th>

                <th className="w-[190px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Updated
                </th>

                <th className="w-[260px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isFolder = item.itemType === 'FOLDER';
                const isSelected = selectedSet.has(item.itemId);
                const isMenuOpen = openMenu?.itemId === item.itemId;

                return (
                  <tr
                    key={item.itemId}
                    className={isSelected ? 'bg-brand-50/50' : 'hover:bg-slate-50'}
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        aria-label={`Select ${item.name}`}
                      />
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        {isFolder ? (
                          <Folder className="h-5 w-5 shrink-0 text-amber-500" />
                        ) : (
                          <File className="h-5 w-5 shrink-0 text-brand-600" />
                        )}

                        <div className="min-w-0 flex-1">
                          {isFolder ? (
                            <button
                              type="button"
                              onClick={() => onOpenFolder(item)}
                              className="block max-w-full truncate text-left font-medium text-slate-900 hover:text-brand-700 hover:underline"
                              title="Open folder"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <p
                              className="max-w-full truncate font-medium text-slate-900"
                              title={item.name}
                            >
                              {item.name}
                            </p>
                          )}

                          {item.isFavorite && (
                            <p className="text-xs text-amber-600">Favorite</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <Badge variant={isFolder ? 'blue' : 'slate'}>
                        {item.itemType}
                      </Badge>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-middle text-sm text-slate-600">
                      {isFolder ? '-' : formatBytes(item.fileSizeBytes)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-middle text-sm text-slate-600">
                      {formatDateTime(item.updatedAt || item.createdAt)}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        {!isFolder && (
                          <button
                            type="button"
                            title="Download"
                            onClick={() => onDownload(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}

                        {!isFolder && (
                          <button
                            type="button"
                            title="Share"
                            onClick={() => onShare(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          title="Favorite"
                          onClick={() => onFavorite(item)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            item.isFavorite
                              ? 'bg-amber-50 text-amber-600'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-amber-600'
                          }`}
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={item.isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => onDelete(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title="More actions"
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          onClick={(event) => handleOpenMenu(event, item)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            isMenuOpen
                              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {openMenu &&
        activeItem &&
        createPortal(
          <div
            role="menu"
            onClick={(event) => event.stopPropagation()}
            style={{
              top: openMenu.top,
              left: openMenu.left,
            }}
            className="fixed z-[9999] w-56 rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl ring-1 ring-black/5"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onRename, activeItem)}
              className={menuItemClass}
            >
              <Edit3 className="h-4 w-4 text-slate-500" />
              Rename
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onMoveToFolder, activeItem)}
              className={menuItemClass}
            >
              <FolderInput className="h-4 w-4 text-slate-500" />
              Move to Folder
            </button>

            {!activeIsFolder && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onCopyToFolder, activeItem)}
                className={menuItemClass}
              >
                <Copy className="h-4 w-4 text-slate-500" />
                Copy to Folder
              </button>
            )}

            {currentFolderId !== 'root' && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onMoveToRoot, activeItem)}
                className={menuItemClass}
              >
                <MoveRight className="h-4 w-4 text-slate-500" />
                Move to My Files
              </button>
            )}

            {!activeIsFolder && (
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onShare, activeItem)}
                className={menuItemClass}
              >
                <Link2 className="h-4 w-4 text-slate-500" />
                Share settings
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}