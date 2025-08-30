import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from './models';
import connectMongoDB from './mongodb';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(): string {
  return randomUUID();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateJWT(userId: string): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return Buffer.from(JSON.stringify(payload) + '.' + secret).toString('base64');
}

export function verifyJWT(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const [payloadStr, tokenSecret] = Buffer.from(token, 'base64').toString().split('.');
    
    if (tokenSecret !== secret) {
      return null;
    }
    
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyJWT(token);
  if (!payload) {
    return null;
  }

  await connectMongoDB();
  return await User.findById(payload.userId);
}

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    contact?: string;
    profileImage?: string;
  };
  message?: string;
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }
  return { success: true, user };
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult;
  }
  if (!authResult.user || authResult.user.role !== 'admin') {
    return { success: false, message: 'Forbidden: Admin access required' };
  }
  return authResult;
}

export async function requireLearner(request: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult;
  }
  if (!authResult.user || authResult.user.role !== 'learner') {
    return { success: false, message: 'Forbidden: Learner access required' };
  }
  return authResult;
}

export async function requireRole(request: NextRequest, role: string): Promise<AuthResult> {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult;
  }
  if (!authResult.user || authResult.user.role !== role) {
    return { success: false, message: `Forbidden: ${role} access required` };
  }
  return authResult;
}