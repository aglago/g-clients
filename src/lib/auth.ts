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

export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}