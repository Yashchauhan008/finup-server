import type { NextFunction, Request, Response } from 'express';
import type { DatabaseClient } from '@/shared/helpers/database.helper.js';
import { STATUS_CODES } from '@/shared/constants/status-codes.js';
import { TOKEN_TYPES } from '../auth.constant.js';
import z from 'zod';
import bcrypt from 'bcryptjs';
import { createJWTToken } from '@/shared/utilities/token.js';

/** Direct signup (no email OTP). Used by FinUp app + web. */
export const ValidationSchema = {
    body: z.object({
        name: z.string().trim().min(1).max(255),
        email: z.email().trim().toLowerCase(),
        password: z.string().trim().min(6).max(255),
    }),
};

export async function Controller(
    req: Request,
    res: Response,
    _next: NextFunction,
    db: DatabaseClient,
) {
    const { name, email, password } = req.body as z.infer<typeof ValidationSchema.body>;

    const existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
        return res.status(STATUS_CODES.CONFLICT).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.queryOne(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, passwordHash],
    );

    const syncRow = await db.queryOne(
        `INSERT INTO user_finup_data (user_id, revision, tables, meta)
         VALUES ($1, 0, '{}'::jsonb, '{}'::jsonb)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING revision`,
        [user.id],
    );

    const accessToken = await createJWTToken(
        { type: TOKEN_TYPES.USER_ACCESS_TOKEN, user_id: user.id },
        '30d',
    );

    return res.status(STATUS_CODES.OK).json({
        token: accessToken,
        user: { id: user.id, name: user.name, email: user.email },
        sync: { revision: Number(syncRow?.revision ?? 0) },
    });
}
