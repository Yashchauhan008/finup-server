import cron from 'node-cron';

import { task as flushUnTrackedFilesTask } from './scripts/flush-untracked-files.script.js';
import { task as flushFilesTask } from './scripts/flush-files.script.js';

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
export const FlushUnTrackedFilesJob = cron.createTask(
    '0 0 */10 * *',
    flushUnTrackedFilesTask,
    { timezone: 'Asia/Kolkata' },
);

export const FlushFilesJob = cron.createTask('0 1 */3 * *', flushFilesTask, {
    timezone: 'Asia/Kolkata',
});
