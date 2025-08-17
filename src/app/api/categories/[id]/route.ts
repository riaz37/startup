import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and slug are required',
        },
        { status: 400 }
      );
    }

    // Check if category already exists with different ID
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: name },
          { slug: slug },
        ],
        NOT: {
          id: id,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category with this name or slug already exists',
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || '',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if category is being used by any products
    const productsUsingCategory = await prisma.product.findFirst({
      where: { categoryId: id },
    });

    if (productsUsingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category that has products. Please reassign or delete the products first.',
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const category = await prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deactivated successfully',
      category,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
      },
      { status: 500 }
    );
  }
} 