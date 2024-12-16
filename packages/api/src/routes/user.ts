import { Router } from 'jsr:@oak/oak';
import { z } from 'npm:zod';
import { hashPassword } from '@/util/functions/hashPassword.ts';
import { findUser, updateUser } from '@/api/src/util/db.ts';
import { comparePasswords } from '@/api/src/util/comparePasswords.ts';

const router = new Router();

router.get('/', async ({ request, response }) => {
    const params = [...request.url.searchParams.entries()].reduce((p, c) => {
        const [key, value] = c;
        p[key] = value;
        return p;
    }, {} as Record<string, unknown>);

    if (!params) {
        response.status = 400;
        return;
    }

    // deno-lint-ignore no-explicit-any
    const user = await findUser(params as any);

    if (user === false) {
        response.status = 404;
        return;
    }

    response.status = 200;
    response.body = user;
});

router.post('/validate', async ({ request: req, response: res }) => {
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

router.put('/password', async ({ request, response }) => {
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

router.put('/email', async ({ request, response }) => {
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

router.put('/passChange', async ({ request, response }) => {
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

router.put('/mailChange', async ({ request, response }) => {
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

router.put('/forcePasskey', async ({ request, response }) => {
    const body = await request.body.json();

    const validation = z
        .object({ forcePasskey: z.boolean(), userID: z.string() })
        .safeParse(body);

    if (!validation.success) {
        response.status = 400;
        return;
    }

    const { data } = validation;

    const success = await updateUser(
        {
            id: data.userID,
        },
        {
            forcePasskey: data.forcePasskey,
        }
    );

    if (!success) {
        response.status = 500;
        return;
    }

    response.status = 200;
});

export default router;
