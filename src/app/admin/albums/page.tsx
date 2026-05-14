'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { getAllAlbums, createAlbum, updateAlbum, deleteAlbum } from '@/lib/services/albums';
import { slugify } from '@/lib/utils/slugify';
import { toast } from 'sonner';
import type { Album, WithId } from '@/types';

interface AlbumFormData {
  name: string;
  description: string;
  parentId: string;
  thumbnail: string;
  year: string;
  isPublished: boolean;
}

const emptyForm: AlbumFormData = {
  name: '',
  description: '',
  parentId: '',
  thumbnail: '',
  year: '',
  isPublished: true,
};

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<WithId<Album>[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AlbumFormData>(emptyForm);

  const fetchAlbums = async () => {
    try {
      const data = await getAllAlbums();
      setAlbums(data);
    } catch (err) {
      console.error('Albums load error:', err);
      toast.error(`Failed to load albums: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return;
    setDeleting(id);
    try {
      await deleteAlbum(id);
      setAlbums(prev => prev.filter(a => a.id !== id));
      toast.success('Album deleted.');
    } catch {
      toast.error('Failed to delete album.');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (album: WithId<Album>) => {
    setEditingId(album.id);
    setForm({
      name: album.name,
      description: album.description || '',
      parentId: album.parentId || '',
      thumbnail: album.thumbnail || '',
      year: album.year ? String(album.year) : '',
      isPublished: album.isPublished,
    });
    setShowForm(true);
  };

  const handleNewAlbum = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Album name is required.');
      return;
    }

    setSaving(true);
    try {
      const albumData = {
        name: form.name.trim(),
        slug: slugify(form.name.trim()),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        thumbnail: form.thumbnail || undefined,
        year: form.year ? Number(form.year) : undefined,
        isPublished: form.isPublished,
        order: editingId
          ? albums.find(a => a.id === editingId)?.order ?? albums.length
          : albums.length,
      };

      if (editingId) {
        await updateAlbum(editingId, albumData);
        toast.success('Album updated.');
      } else {
        await createAlbum(albumData);
        toast.success('Album created.');
      }

      handleCancel();
      setLoading(true);
      await fetchAlbums();
    } catch (err) {
      console.error('Album save error:', err);
      toast.error(`${editingId ? 'Failed to update' : 'Failed to create'} album: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = albums.find(a => a.id === parentId);
    return parent?.name || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-earth-800">Albums</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleNewAlbum}>
          New Album
        </Button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="font-heading font-semibold text-earth-800 mb-4">
            {editingId ? 'Edit Album' : 'New Album'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Rongali Bihu 2025 Photos"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-earth-700">Parent Folder</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
              >
                <option value="">None (Top Level)</option>
                {albums
                  .filter(a => a.id !== editingId)
                  .map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional album description..."
                rows={3}
                className="block w-full rounded-lg border border-earth-300 px-3.5 py-2.5 text-sm text-earth-800 bg-white placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500"
              />
            </div>
            <Input
              label="Year"
              type="number"
              value={form.year}
              onChange={(e) => setForm(prev => ({ ...prev, year: e.target.value }))}
              placeholder="e.g. 2025"
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded border-earth-300 text-gamosa-500 focus:ring-gamosa-500"
                />
                <span className="text-sm font-medium text-earth-700">Published</span>
              </label>
            </div>
            <div className="lg:col-span-2">
              <FileUploadField
                label="Thumbnail"
                value={form.thumbnail}
                onChange={(url) => setForm(prev => ({ ...prev, thumbnail: url }))}
                type="image"
                storagePath="albums/thumbnails"
                helperText="Cover image for this album"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingId ? 'Update Album' : 'Create Album'}
            </Button>
          </div>
        </Card>
      )}

      {/* Albums List */}
      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-earth-400">
          <FolderOpen className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">No albums yet</p>
          <p className="text-xs mt-1">Create an album to organize your media</p>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <Card key={album.id} padding="none" className="flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-earth-100 overflow-hidden shrink-0">
                {album.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-earth-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/albums/${album.id}`}
                    className="font-heading font-semibold text-earth-800 hover:text-gamosa-600 transition-colors truncate"
                  >
                    {album.name}
                  </Link>
                  <Badge variant={album.isPublished ? 'tea' : 'default'}>
                    {album.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                {album.description && (
                  <p className="text-sm text-earth-500 truncate mt-0.5">{album.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {album.year && (
                    <span className="text-xs text-earth-400">{album.year}</span>
                  )}
                  {getParentName(album.parentId) && (
                    <span className="text-xs text-earth-400">
                      in {getParentName(album.parentId)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/admin/albums/${album.id}`}>
                  <Button variant="ghost" size="sm">
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(album)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(album.id)}
                  isLoading={deleting === album.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
