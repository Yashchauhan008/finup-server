import type { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from '@/shared/constants/status-codes.js';
import { decodeJWTToken } from '@/shared/utilities/token.js';
import { TOKEN_TYPES } from '../auth.constant.js';

type AccessPayload = {
    type?: string;
    user_id?: string;
};

export default async function requireUser(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Missing auth token' });
    }

    const payload = await decodeJWTToken<AccessPayload>(token);
    if (!payload || payload.type !== TOKEN_TYPES.USER_ACCESS_TOKEN || !payload.user_id) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }

    req.user = { id: payload.user_id };
    return next();
}
