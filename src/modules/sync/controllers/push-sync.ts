import type { NextFunction, Request, Response } from 'express';
import type { DatabaseClient } from '@/shared/helpers/database.helper.js';
import { STATUS_CODES } from '@/shared/constants/status-codes.js';
import { FINUP_TABLES } from '@/modules/sync/sync.constants.js';
import SocketService from '@/socket.js';
import z from 'zod';

const tableRow = z.record(z.string(), z.unknown());

export const ValidationSchema = {
    body: z.object({
        /** Last server revision this client successfully synced from. */
        baseRevision: z.coerce.number().int().min(0),
        clientId: z.string().trim().min(1).max(128),
        /** When true, overwrite even if another client wrote first (explicit LWW). */
        force: z.boolean().optional().default(false),
        tables: z.record(z.string(), z.array(tableRow)),
        meta: z.record(z.string(), z.unknown()).optional().default({}),
    }),
};

function sanitizeTables(input: Record<string, unknown[]>) {
    const out: Record<string, unknown[]> = {};
    for (const name of FINUP_TABLES) {
        const rows = input[name];
        out[name] = Array.isArray(rows) ? rows : [];
    }
    return out;
}

export async function Controller(
    req: Request,
    res: Response,
    _next: NextFunction,
    db: DatabaseClient,
) {
    const userId = req.user!.id;
    const body = req.body as z.infer<typeof ValidationSchema.body>;
    const tables = sanitizeTables(body.tables as Record<string, unknown[]>);

    await db.begin();
    try {
        let current = await db.queryOne(
            `SELECT revision, updated_at, client_id, tables, meta
             FROM user_finup_data WHERE user_id = $1 FOR UPDATE`,
            [userId],
        );

        if (!current) {
            current = await db.queryOne(
                `INSERT INTO user_finup_data (user_id, revision, tables, meta)
                 VALUES ($1, 0, '{}'::jsonb, '{}'::jsonb)
                 RETURNING revision, updated_at, client_id, tables, meta`,
                [userId],
            );
        }

        const serverRevision = Number(current.revision);

        if (!body.force && body.baseRevision < serverRevision) {
            await db.rollback();
            return res.status(STATUS_CODES.CONFLICT).json({
                message:
                    'Sync conflict: cloud data changed on another device. Pull, merge, then push again (or force).',
                code: 'SYNC_CONFLICT',
                sync: {
                    revision: serverRevision,
                    updatedAt: current.updated_at,
                    clientId: current.client_id,
                    tables: current.tables ?? {},
                    meta: current.meta ?? {},
                },
            });
        }

        const next = await db.queryOne(
            `UPDATE user_finup_data
             SET revision = revision + 1,
                 updated_at = now(),
                 client_id = $2,
                 tables = $3::jsonb,
                 meta = $4::jsonb
             WHERE user_id = $1
             RETURNING revision, updated_at, client_id`,
            [userId, body.clientId, JSON.stringify(tables), JSON.stringify(body.meta ?? {})],
        );

        await db.commit();

        try {
            SocketService.io?.to(userId).emit('sync:updated', {
                revision: Number(next.revision),
                updatedAt: next.updated_at,
                clientId: next.client_id,
            });
        } catch {
            /* realtime notify is best-effort */
        }

        return res.status(STATUS_CODES.OK).json({
            revision: Number(next.revision),
            updatedAt: next.updated_at,
            clientId: next.client_id,
        });
    } catch (err) {
        await db.rollback();
        throw err;
    }
}
