import { Router } from 'jsr:@oak/oak';
import {
    db,
    findProxy,
    proxySchema,
    pushProxy,
    updateProxy,
} from '@/api/src/util/db.ts';

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

        const success = await updateProxy({ id }, data);

        if (!success) {
            response.status = 500;
            return;
        }

        response.status = 200;
    });

export default router;
