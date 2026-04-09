'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Trash2, X, ZoomIn, Loader2 } from 'lucide-react';
import { idbGetPhotosForDoc, idbAddPhoto, idbDeletePhoto, PhotoEntry } from '@/lib/db';
import { toast } from 'sonner';

interface PhotoAttachmentsProps {
  docId: string;
}

const MAX_PHOTOS = 10;
const MAX_SIZE_MB = 5;

export default function PhotoAttachments({ docId }: PhotoAttachmentsProps) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null); // object URL
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    const result = await idbGetPhotosForDoc(docId);
    setPhotos(result);
    setLoading(false);
  }, [docId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos per document`);
      return;
    }

    setUploading(true);
    let added = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB} MB limit`);
        continue;
      }
      if (photos.length + added >= MAX_PHOTOS) break;

      const entry: PhotoEntry = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        docId,
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        addedAt: new Date().toISOString(),
      };
      await idbAddPhoto(entry);
      added++;
    }

    if (added > 0) {
      toast.success(`${added} photo${added > 1 ? 's' : ''} added`);
      await loadPhotos();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (photo: PhotoEntry) => {
    await idbDeletePhoto(photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast.success('Photo removed');
  };

  const openLightbox = (photo: PhotoEntry) => {
    const url = URL.createObjectURL(photo.blob);
    setLightbox(url);
  };

  const closeLightbox = () => {
    if (lightbox) URL.revokeObjectURL(lightbox);
    setLightbox(null);
  };

  return (
    <div className="mt-3">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Camera size={13} className="text-violet-400" />
          <span className="text-xs font-600 text-slate-500">
            Photos {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}
          </span>
        </div>
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 font-500 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
            {uploading ? 'Adding…' : 'Add Photo'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={12} className="animate-spin text-slate-300" />
          <span className="text-xs text-slate-300">Loading photos…</span>
        </div>
      ) : photos.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-violet-200 text-xs text-violet-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/40 transition-all duration-150 disabled:opacity-50"
        >
          <ImagePlus size={14} />
          Attach photos (optional)
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {photos.map((photo) => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              onDelete={handleDelete}
              onOpen={openLightbox}
            />
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-violet-200 flex items-center justify-center text-violet-300 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/40 transition-all duration-150 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={closeLightbox}
          >
            <X size={18} />
          </button>
          <Image
            src={lightbox}
            alt="Document photo"
            width={1600}
            height={1200}
            unoptimized
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ─── Thumbnail sub-component ──────────────────────────────────────────────────

interface PhotoThumbProps {
  photo: PhotoEntry;
  onDelete: (p: PhotoEntry) => void;
  onOpen: (p: PhotoEntry) => void;
}

function PhotoThumb({ photo, onDelete, onOpen }: PhotoThumbProps) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo.blob]);

  if (!url) return null;

  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200/60 shadow-sm">
      <Image src={url} alt={photo.name} fill unoptimized sizes="96px" className="object-cover" />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => onOpen(photo)}
          className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow"
          title="View full size"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={() => onDelete(photo)}
          className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow"
          title="Remove photo"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
