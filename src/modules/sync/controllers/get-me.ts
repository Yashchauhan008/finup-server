import type { NextFunction, Request, Response } from 'express';
import type { DatabaseClient } from '@/shared/helpers/database.helper.js';
import { STATUS_CODES } from '@/shared/constants/status-codes.js';

export async function Controller(
    req: Request,
    res: Response,
    _next: NextFunction,
    db: DatabaseClient,
) {
    const userId = req.user!.id;
    const user = await db.queryOne(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [userId],
    );
    if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    const data = await db.queryOne(
        `SELECT revision, updated_at, client_id
         FROM user_finup_data WHERE user_id = $1`,
        [userId],
    );

    return res.status(STATUS_CODES.OK).json({
        user,
        sync: data
            ? {
                  revision: Number(data.revision),
                  updatedAt: data.updated_at,
                  clientId: data.client_id,
              }
            : { revision: 0, updatedAt: null, clientId: null },
    });
}
