import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from './env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string | null;
  [key: string]: any;
}

/**
 * Generate a signed JWT
 */
export function signToken(payload: TokenPayload, options?: SignOptions): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
    ...options,
  });
}

/**
 * Verify and decode an incoming JWT
 */
export function verifyToken<T = TokenPayload>(token: string): T {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch (error: any) {
    throw new Error('INVALID_OR_EXPIRED_TOKEN');
  }
}