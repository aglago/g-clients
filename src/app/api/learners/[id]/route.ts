import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const learner = await userService.getUserById(id);
    
    if (!learner || learner.role !== 'learner') {
      return NextResponse.json(
        { success: false, message: 'Learner not found' },
        { status: 404 }
      );
    }

    const sanitizedLearner = {
      id: learner.id,
      firstName: learner.firstName,
      lastName: learner.lastName,
      email: learner.email,
      contact: learner.contact,
      createdAt: learner.createdAt,
      updatedAt: learner.updatedAt
    };
    
    return NextResponse.json(sanitizedLearner);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Get learner error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch learner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const learner = await userService.getUserById(id);
    if (!learner || learner.role !== 'learner') {
      return NextResponse.json(
        { success: false, message: 'Learner not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, contact } = body;
    
    const updates: Partial<{firstName: string; lastName: string; contact: string}> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (contact !== undefined) updates.contact = contact;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedLearner = await userService.updateUser(id, updates);
    
    if (!updatedLearner) {
      return NextResponse.json(
        { success: false, message: 'Failed to update learner' },
        { status: 500 }
      );
    }

    const sanitizedLearner = {
      id: updatedLearner.id,
      firstName: updatedLearner.firstName,
      lastName: updatedLearner.lastName,
      email: updatedLearner.email,
      contact: updatedLearner.contact,
      createdAt: updatedLearner.createdAt,
      updatedAt: updatedLearner.updatedAt
    };
    
    return NextResponse.json(sanitizedLearner);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Update learner error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update learner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const learner = await userService.getUserById(id);
    if (!learner || learner.role !== 'learner') {
      return NextResponse.json(
        { success: false, message: 'Learner not found' },
        { status: 404 }
      );
    }

    await userService.deleteUser(id);
    
    return NextResponse.json(
      { success: true, message: 'Learner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Delete learner error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete learner' },
      { status: 500 }
    );
  }
}