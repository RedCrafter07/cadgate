import { Router } from 'jsr:@oak/oak';
import { db, findUser } from '@/api/src/util/db.ts';
import * as caddyAPI from '@/util/caddy.ts';

const router = new Router();

router.post('/caddy/reset', async ({ request, response }) => {
    const { uID } = await request.body.json();

    const user = await findUser({ id: uID });

    if (!user) {
        response.status = 401;
        return;
    }

    if (!user.administrator) {
        response.status = 401;
        return;
    }

    const proxyEntries = await db.getData('proxyEntries');
    const redirectEntries = await db.getData('redirectEntries');

    await caddyAPI.resetConfig();
    await caddyAPI.initialize();
    await caddyAPI.createFromConfig({ proxyEntries, redirectEntries });

    response.status = 200;
});

export default router;
