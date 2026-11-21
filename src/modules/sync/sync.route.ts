import { Router } from 'express';
import withDatabase from '@/shared/utilities/with-database.js';
import validate from '@/shared/middlewares/request-validator.js';
import requireUser from '@/modules/auth/middlewares/require-user.js';

import {
    Controller as getMe,
} from '@/modules/sync/controllers/get-me.js';
import {
    Controller as pullSync,
} from '@/modules/sync/controllers/pull-sync.js';
import {
    Controller as pushSync,
    ValidationSchema as pushSyncValidationSchema,
} from '@/modules/sync/controllers/push-sync.js';

const router = Router();

router.use(requireUser);

router.route('/me').get(withDatabase(getMe));
router.route('/pull').get(withDatabase(pullSync));
router
    .route('/push')
    .post(validate(pushSyncValidationSchema), withDatabase(pushSync));

export default router;
