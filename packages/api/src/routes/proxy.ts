import { Router } from 'jsr:@oak/oak';
import {
    db,
    deleteProxy,
    findProxy,
    proxySchema,
    pushProxy,
    updateProxy,
} from '@/api/src/util/db.ts';
import * as caddyAPI from '@/util/caddy.ts';
import { cloudflareHandler } from '@/api/src/util/cloudflareHandler.ts';

const router = new Router()
    .get('/', async ({ response: res }) => {
        const proxyEntries = await db.getData('proxyEntries');

        res.status = 200;
        res.body = proxyEntries;
    })
    .post('/', async ({ request, response }) => {
        const input = await request.body.json();

        const validation = proxySchema.safeParse(input);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const { data } = validation;

        const success = await pushProxy(data);

        if (!success) {
            response.status = 500;
            return;
        }

        await cloudflareHandler(data, 'create');
        await caddyAPI.createProxyRoute(data);

        response.status = 200;
    })
    .get('/:id', async ({ params, response }) => {
        const { id } = params;

        const proxyEntry = await findProxy({ id });

        response.status = 200;
        response.body = proxyEntry;
    })
    .put('/:id', async ({ params, request, response }) => {
        const { id } = params;

        const validation = proxySchema
            .partial()
            .safeParse(await request.body.json());

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const { data } = validation;

        const success = await updateProxy({ id }, { ...data, id });

        if (!success) {
            response.status = 500;
            return;
        }

        const proxy = await findProxy({ id });

        if (!proxy) {
            response.status = 500;
            return;
        }

        await cloudflareHandler(proxy, 'edit');
        await caddyAPI.updateProxyRoute(proxy);

        response.status = 200;
    })
    .delete('/:id', async ({ params, response }) => {
        const { id } = params;

        const proxy = await findProxy({ id });
        if (!proxy) {
            response.status = 404;
            return;
        }

        const success = await deleteProxy({ id });

        if (!success) {
            response.status = 500;
            return;
        }

        await cloudflareHandler(proxy, 'delete');
        await caddyAPI.deleteProxyRoute(id);

        response.status = 200;
    });

export default router;
