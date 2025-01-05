import { Router } from 'jsr:@oak/oak';
import { db, findUser } from '@/api/src/util/db.ts';
import * as caddyAPI from '@/util/caddy.ts';
import { z } from 'npm:zod';
import { Cloudflare } from '@/util/cloudflare.ts';

const router = new Router();

router.use(async ({ request, response }, next) => {
    let uID;

    if (request.method === 'GET' || request.method === 'DELETE') {
        uID = request.headers.get('uID');
    } else {
        uID = (await request.body.json()).uID;
    }

    const user = await findUser({ id: uID });

    if (!user) {
        response.status = 401;
        return;
    }

    if (!user.administrator) {
        response.status = 401;
        return;
    }

    await next();
});

router.post('/caddy/reset', async ({ response }) => {
    const proxyEntries = await db.getData('proxyEntries');
    const redirectEntries = await db.getData('redirectEntries');

    await caddyAPI.resetConfig();
    await caddyAPI.initialize();
    await caddyAPI.createFromConfig({ proxyEntries, redirectEntries });

    response.status = 200;
});

router
    .get('/cloudflare', async ({ response }) => {
        const system = await db.getData('system');

        if (!system) {
            response.status = 500;
            return;
        }

        const { cfEnabled, cfKey, cfUseProxy, ip } = system;

        const data = { cfEnabled, cfKey, cfUseProxy, ip };

        response.status = 200;
        response.body = data;
    })
    .post('/cloudflare', async ({ request, response }) => {
        const body = await request.body.json();

        const schema = z.object({
            enabled: z.boolean(),
        });

        const validation = schema.safeParse(body);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const {
            data: { enabled },
        } = validation;

        if (enabled === true) {
            const systemData = await db.getData('system');

            if (
                systemData.ip !== undefined &&
                systemData.cfKey !== undefined &&
                systemData.cfUseProxy !== undefined
            ) {
                await db.push('system.cfEnabled', true);
                response.status = 200;
            } else {
                await db.push('system.cfEnabled', false);
                response.status = 400;
            }
        } else {
            db.push('system.cfEnabled', false);
            response.status = 200;
        }
    })
    .put('/cloudflare', async ({ request, response }) => {
        const body = await request.body.json();

        const schema = z.object({
            apiKey: z.string(),
            useProxy: z.boolean(),
        });

        const validation = schema.safeParse(body);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const {
            data: { apiKey, useProxy },
        } = validation;

        const { valid: validKey, zones } = await validateCloudflareCredentials(
            apiKey
        );

        if (!validKey) {
            response.status = 401;
            return;
        }

        await db.push('system.cfKey', apiKey);
        await db.push('system.cfUseProxy', useProxy);

        const systemData = await db.getData('system');

        if (
            systemData.ip === undefined ||
            systemData.cfKey === undefined ||
            systemData.cfUseProxy === undefined
        )
            await db.push('system.cfEnabled', false);

        response.status = 200;
        response.body = { zones };
    })
    .delete('/cloudflare', async ({ response }) => {
        await db.push('system.cfEnabled', false);
        await db.delete('system.cfKey');
        await db.delete('system.cfUseProxy');

        response.status = 200;
    });

router
    .get('/tls/mail', async ({ response }) => {
        const ip = (await db.getData('system')).ip;

        response.body = { ip };
        response.status = 200;
    })
    .post('/tls/mail', async ({ request, response }) => {
        const body = await request.body.json();

        const schema = z.object({ mail: z.string().email() });

        const validation = await schema.safeParse(body);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const { data } = validation;

        await db.push('system.tls', {
            email: data.mail,
        });

        response.status = 200;
    })
    .delete('/tls/mail', async ({ response }) => {
        await db.delete('system.tls');

        response.status = 200;
    });

router
    .get('/accessURL', async ({ response }) => {
        const accessURL = (await db.getData('system')).mainURL;

        response.body = { accessURL };
        response.status = 200;
    })
    .post('/accessURL', async ({ request, response }) => {
        const json = await request.body.json();

        const schema = z.object({
            accessURL: z.string(),
        });

        const validation = schema.safeParse(json);

        if (!validation.success) {
            response.status = 401;
            return;
        }

        const { data } = validation;

        await db.push('system.mainURL', data.accessURL);

        response.status = 200;
    });

router
    .get('/ip', async ({ response }) => {
        const ip = (await db.getData('system')).ip;

        response.body = { ip };
        response.status = 200;
    })
    .post('/ip/auto', async ({ response }) => {
        response.status = 501;
        return;

        const ip = await Deno.resolveDns('host.docker.internal', 'A');

        response.body = { ip };
        response.status = 200;
    })
    .put('/ip', async ({ request, response }) => {
        const body = await request.body.json();

        const schema = z.object({ ip: z.string().ip() });

        const validation = schema.safeParse(body);

        if (!validation.success) {
            response.status = 400;
            return;
        }

        const {
            data: { ip },
        } = validation;

        await db.push('system.ip', ip);

        const systemData = await db.getData('system');

        if (
            systemData.ip === undefined ||
            systemData.cfKey === undefined ||
            systemData.cfUseProxy === undefined
        )
            await db.push('system.cfEnabled', false);

        response.status = 200;
    })
    .delete('/ip', async ({ response }) => {
        await db.delete('system.ip');
        await db.push('system.cfEnabled', false);

        response.status = 200;
    });

export default router;

async function validateCloudflareCredentials(key: string) {
    const cf = new Cloudflare({ apiKey: key, serverIP: '', useProxy: true });

    const valid = await cf.validateKey();

    if (valid) {
        const zones = (await cf.getZones()).map((z) => z.name);

        return { valid, zones };
    }

    return { valid };
}
