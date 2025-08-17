import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Upload image to Cloudinary
export async function uploadImage(
  file: Express.Multer.File,
  folder: string = 'sohozdaam'
): Promise<{ url: string; publicId: string }> {
  try {
    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize large images
        { quality: 'auto:good' }, // Optimize quality
        { format: 'auto' } // Auto-format (webp if supported)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

// Generate optimized image URL with transformations
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  const { width, height, quality = 'auto:good', format = 'auto' } = options;
  
  let transformation = '';
  
  if (width || height) {
    transformation += `w_${width || 'auto'},h_${height || 'auto'},c_limit/`;
  }
  
  transformation += `q_${quality},f_${format}`;
  
  return cloudinary.url(publicId, {
    transformation: transformation,
    secure: true
  });
}

// Upload multiple images
export async function uploadMultipleImages(
  files: Express.Multer.File[],
  folder: string = 'sohozdaam'
): Promise<Array<{ url: string; publicId: string }>> {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
} 