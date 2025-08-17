import multer from 'multer';

// Configure multer for memory storage (to work with Cloudinary)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Single image upload middleware
export const singleImageUpload = upload.single('image');

// Multiple images upload middleware
export const multipleImagesUpload = upload.array('images', 5); // Max 5 images

// Helper function to handle multer errors
export function handleMulterError(error: unknown): string {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File too large. Maximum size is 5MB.';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files. Maximum is 5 files.';
      default:
        return 'File upload error';
    }
  }
  
  if (error instanceof Error) {
    if (error.message === 'Only image files are allowed') {
      return 'Only image files are allowed';
    }
    return error.message;
  }
  
  return 'Unknown upload error';
} 