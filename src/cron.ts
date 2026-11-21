import cron from 'node-cron';

import { task as databaseBackupTask } from '@/scripts/databaseBackup.script.js';

/**
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
*/

// Always use in-process callbacks (string paths break under node-cron daemon + ESM aliases).
export const DatabaseBackupJob = cron.createTask('0 1 */3 * *', databaseBackupTask, {
    timezone: 'Asia/Kolkata',
});
