import { Router } from 'jsr:@oak/oak';
import {
    db,
    findRedirect,
    redirectSchema,
    pushRedirect,
    updateRedirect,
    deleteRedirect,
} from '@/api/src/util/db.ts';
import * as caddyAPI from '@/util/caddy.ts';
import { cloudflareHandler } from '@/api/src/util/cloudflareHandler.ts';

const router = new Router()
    .get('/', async ({ response: res }) => {
        const redirectEntries = await db.getData('redirectEntries');

        res.status = 200;
        res.body = redirectEntries;
    })
    .post('/', async ({ request, response }) => {
        const input = await request.body.json();

        const validation = redirectSchema.safeParse(input);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const { data } = validation;

        const success = await pushRedirect(data);

        if (!success) {
            response.status = 500;
            return;
        }

        await caddyAPI.createRedirectRoute(data);
        await cloudflareHandler(data, 'create');

        response.status = 200;
    })
    .get('/:id', async ({ params, response }) => {
        const { id } = params;

        const redirectEntry = await findRedirect({ id });

        response.status = 200;
        response.body = redirectEntry;
    })
    .put('/:id', async ({ params, request, response }) => {
        const { id } = params;

        const validation = redirectSchema
            .partial()
            .safeParse(await request.body.json());

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const { data } = validation;

        const success = await updateRedirect({ id }, data);

        if (!success) {
            response.status = 500;
            return;
        }

        const redirect = await findRedirect({ id });

        if (!redirect) {
            response.status = 500;
            return;
        }

        await caddyAPI.updateRedirectRoute(redirect);
        await cloudflareHandler(redirect, 'edit');

        response.status = 200;
    })
    .delete('/:id', async ({ params, response }) => {
        const { id } = params;

        const redirect = await findRedirect({ id });

        if (!redirect) {
            response.status = 404;
            return;
        }

        const success = await deleteRedirect({ id });

        if (!success) {
            response.status = 500;
            return;
        }

        await caddyAPI.deleteRedirectRoute(id);
        await cloudflareHandler(redirect, 'delete');

        response.status = 200;
    });

export default router;
