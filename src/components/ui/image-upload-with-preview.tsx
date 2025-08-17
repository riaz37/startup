"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { X, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from './card';
import { Badge } from './badge';

interface ImageUploadWithPreviewProps {
  onImageUpload: (imageUrl: string, publicId: string) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  className?: string;
  disabled?: boolean;
  previewType: 'product' | 'group-order';
  previewData?: {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    unit?: string;
    unitSize?: string;
    minThreshold?: number;
    targetQuantity?: number;
    expiresAt?: string;
  };
}

export function ImageUploadWithPreview({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  className = "",
  disabled = false,
  previewType,
  previewData = {}
}: ImageUploadWithPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [showPreview, setShowPreview] = useState(true);

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

  const renderProductPreview = () => (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={previewData.name || "Product"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="h-16 w-16 text-muted-foreground border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8" />
              </div>
            </div>
          )}
          <Badge variant="default" className="absolute top-2 right-2">
            Active
          </Badge>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {previewData.name || "Product Name"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {previewData.description || "Product description will appear here"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {previewData.category || "Category"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {previewData.unitSize || "1"} {previewData.unit || "unit"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">MRP:</span>
              <span className="font-medium">৳{previewData.price || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selling Price:</span>
              <span className="font-medium text-primary">৳{previewData.price || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min Order:</span>
              <span className="font-medium">1</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Updated: Just now
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGroupOrderPreview = () => (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-4">
        {/* Group Order Image */}
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Group Order"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="h-16 w-16 text-muted-foreground border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8" />
              </div>
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 right-2">
            Group Order
          </Badge>
        </div>

        {/* Group Order Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {previewData.name || "Group Order Title"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {previewData.description || "Group order description will appear here"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min Threshold:</span>
              <span className="font-medium">{previewData.minThreshold || "10"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Quantity:</span>
              <span className="font-medium">{previewData.targetQuantity || "50"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Unit:</span>
              <span className="font-medium text-primary">৳{previewData.price || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium">{previewData.expiresAt || "7 days"}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Created: Just now
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Image Preview</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>
      </div>

      {/* Preview Card */}
      {showPreview && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">
            How it will look:
          </h4>
          {previewType === 'product' ? renderProductPreview() : renderGroupOrderPreview()}
        </div>
      )}

      {/* Current Image Display */}
      {previewUrl && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Current Image:</h4>
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image
                src={previewUrl}
                alt="Uploaded image"
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