import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services';
import { requireAuth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { firstName, lastName, contact } = body;
    
    const updates: { firstName?: string; lastName?: string; contact?: string } = {};
    
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (contact !== undefined) updates.contact = contact;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await userService.updateUser(user.id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        contact: updatedUser.contact
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Profile update failed' },
      { status: 500 }
    );
  }
}