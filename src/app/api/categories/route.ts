import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: name },
          { slug: slug },
        ],
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

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || '',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
      },
      { status: 500 }
    );
  }
} 