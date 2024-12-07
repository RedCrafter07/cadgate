import { z } from 'npm:zod';
import { Application, Router } from 'jsr:@oak/oak';

import { findUser, updateUser } from './util/db.ts';
import { hashPassword } from '@/util/functions/hashPassword.ts';
import proxy from './util/routes/proxy.ts';

const PORT = Number(Deno.env.get('PORT')) || 2000;

const app = new Application();

const router = new Router();

// TODO:
// - Audit Logging
// - User management & permissions
// - Redirect Settings
// - System Settings
// - Caddy Config Generation
// - 2FA/WebAuthn

// Done:
// - Proxy Settings

router.use('/proxy', proxy.routes(), proxy.allowedMethods());

router.get('/user', async ({ request, response }) => {
    const params = [...request.url.searchParams.entries()].reduce((p, c) => {
        const [key, value] = c;
        p[key] = value;
        return p;
    }, {} as Record<string, unknown>);

    if (!params) {
        response.status = 400;
        return;
    }

    const user = await findUser(params as any);

    if (user === false) {
        response.status = 404;
        return;
    }

    response.status = 200;
    response.body = user;
});

router.post('/user/validate', async ({ request: req, response: res }) => {
    const bodySchema = z.object({
        id: z.string(),
        password: z.string(),
    });

    const validation = bodySchema.safeParse(await req.body.json());

    if (!validation.success) {
        res.status = 400;
        res.body = validation.error;
        return;
    }

    const { data } = validation;

    const user = await findUser({ id: data.id });

    if (!user) {
        res.status = 404;
        return;
    }

    const { passwordHash } = user;

    const passwordMatch = await comparePasswords(passwordHash, data.password);

    res.status = 200;
    res.body = {
        valid: passwordMatch,
    };
});

router.put('/user/password', async ({ request, response }) => {
    const requestSchema = z.object({
        id: z.string(),
        current: z.string().optional(),
        to: z.string(),
    });

    const validation = requestSchema.safeParse(await request.body.json());

    if (!validation.success) {
        response.status = 400;
        return;
    }

    const { data } = validation;

    const user = await findUser({ id: data.id });

    if (!user) {
        response.status = 404;
        return;
    }

    if (data.current) {
        if (!(await comparePasswords(user.passwordHash, data.current))) {
            response.status = 401;
            return;
        }
    }

    user.requiresNewPassword = false;

    const passwordHash = await hashPassword(data.to);

    const success = await updateUser(
        { id: user.id },
        {
            passwordHash,
        }
    );

    if (!success) {
        response.status = 500;
        return;
    }

    response.status = 200;
});

router.put('/user/email', async ({ request, response }) => {
    const requestSchema = z.object({
        id: z.string(),
        to: z.string().email(),
    });

    const validation = requestSchema.safeParse(await request.body.json());

    if (!validation.success) {
        response.status = 400;
        return;
    }

    const { data } = validation;

    const user = await findUser({ id: data.id });

    if (!user) {
        response.status = 404;
        return;
    }

    user.requiresNewEmail = false;

    const success = await updateUser(
        { id: user.id },
        {
            email: data.to,
        }
    );

    if (!success) {
        response.status = 500;
        return;
    }

    response.status = 200;
});

router.put('/user/passChange', async ({ request, response }) => {
    const { change, user: userFilter } = await request.body.json();

    const user = await findUser(userFilter);

    if (!user) {
        response.status = 404;
        return;
    }

    const success = await updateUser(
        { id: user.id },
        { requiresNewPassword: change }
    );

    response.status = 200;
    response.body = { success };
});

router.put('/user/mailChange', async ({ request, response }) => {
    const { change, user: userFilter } = await request.body.json();

    const user = await findUser(userFilter);

    if (!user) {
        response.status = 404;
        return;
    }

    const success = await updateUser(
        { id: user.id },
        { requiresNewEmail: change }
    );

    response.status = 200;
    response.body = { success };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port, secure }) => {
    console.log(
        `Listening on: ${secure ? 'https://' : 'http://'}${
            hostname ?? 'localhost'
        }:${port}`
    );
});

app.listen({
    port: PORT,
});

async function comparePasswords(hash: string, input: string) {
    const hashedPassword = await hashPassword(input);

    return hashedPassword === hash;
}
