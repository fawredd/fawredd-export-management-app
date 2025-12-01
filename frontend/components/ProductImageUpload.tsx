'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductImageUploadProps {
  productId: string;
  currentImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

export function ProductImageUpload({ productId, currentImages = [], onImagesChange }: ProductImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  }, [productId]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        await uploadFiles(validFiles);
      }
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxImages = 10;

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed per product`);
      return [];
    }

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Only JPG, PNG, and WebP images are allowed`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 5MB`);
        return false;
      }
      return true;
    });

    const remainingSlots = maxImages - images.length;
    if (validFiles.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`);
      return validFiles.slice(0, remainingSlots);
    }

    return validFiles;
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadProductImages(productId, files);
      const newImages = [...images, ...result.imageUrls];
      setImages(newImages);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiClient.deleteProductImage(productId, imageUrl);
      const newImages = images.filter(img => img !== imageUrl);
      setImages(newImages);
      onImagesChange?.(newImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 5MB (max 10 images)</p>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDelete(imageUrl)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading...</p>
        </div>
      )}
    </div>
  );
}
