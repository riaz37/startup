import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib';
import { singleImageUpload, handleMulterError } from '@/lib/cloudinary/multer-config';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle file upload using multer
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Convert File to Buffer for multer processing
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a mock multer file object
    const multerFile = {
      fieldname: 'image',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      buffer: buffer,
      size: file.size
    } as Express.Multer.File;

    // Upload to Cloudinary
    const result = await uploadImage(multerFile, 'sohozdaam');

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      publicId: result.publicId,
      message: "Image uploaded successfully"
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error instanceof Error) {
      const errorMessage = handleMulterError(error);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
} 