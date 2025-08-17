"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, publicId: string) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  className = "",
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to our API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Set preview
      setPreviewUrl(result.imageUrl);
      
      // Call parent callback
      onImageUpload(result.imageUrl, result.publicId);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  });

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {previewUrl && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={previewUrl}
              alt="Product image"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to select a file
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WEBP up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{uploadError}</p>
        </div>
      )}

      {/* Manual Upload Button */}
      {!previewUrl && !isUploading && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.click();
            }}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
        </div>
      )}
    </div>
  );
} 