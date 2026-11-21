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

    let row = await db.queryOne(
        `SELECT revision, updated_at, client_id, tables, meta
         FROM user_finup_data WHERE user_id = $1`,
        [userId],
    );

    if (!row) {
        row = await db.queryOne(
            `INSERT INTO user_finup_data (user_id, revision, tables, meta)
             VALUES ($1, 0, '{}'::jsonb, '{}'::jsonb)
             ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
             RETURNING revision, updated_at, client_id, tables, meta`,
            [userId],
        );
    }

    return res.status(STATUS_CODES.OK).json({
        revision: Number(row.revision),
        updatedAt: row.updated_at,
        clientId: row.client_id,
        tables: row.tables ?? {},
        meta: row.meta ?? {},
    });
}
