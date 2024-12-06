import { z } from 'npm:zod';
import { Application, Router } from 'jsr:@oak/oak';

import { dbSchema } from '@/util/schemas/db.ts';
import { Database } from '@/util/db/index.ts';
import { hashPassword } from '@/util/functions/hashPassword.ts';

const PORT = Number(Deno.env.get('PORT')) || 2000;
const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;

const db = new Database(DATABASE_PATH, dbSchema);

const app = new Application();

const router = new Router();

router.get('/proxy', async ({ response: res }) => {
    const proxyEntries = await db.getData('proxyEntries');

    res.status = 200;

    res.body = proxyEntries;
});

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

    const success = await updateUser(user.id, {
        ...user,
        passwordHash,
    });

    if (!success) {
        response.status = 500;
        return;
    }

    response.status = 200;
});

router.put('/user/email', async ({ request, response }) => {
    const requestSchema = z.object({
        id: z.string(),
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

    user.requiresNewEmail = false;

    const success = await updateUser(user.id, {
        ...user,
        email: data.to,
    });

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

    const success = await updateUser(user.id, { requiresNewPassword: change });

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

    const success = await updateUser(user.id, { requiresNewEmail: change });

    response.status = 200;
    response.body = { success };
});

app.use(router.routes());
// app.use(router.allowedMethods());

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

const userSchema = dbSchema.shape.users.element;
const userFields = userSchema.keyof();
type userKeys = z.infer<typeof userFields>;
type userSchema = z.infer<typeof userSchema>;

async function updateUser(id: string, data: Partial<userSchema>) {
    const parseResult = userSchema.safeParse(data);

    if (!parseResult.success) return false;

    const users = await db.getData('users');

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex < 0) return false;

    const user = users[userIndex];

    for (const key in data) {
        const typedKey = key as userKeys;
        const property = data[typedKey];

        user[typedKey] = property as never;
    }

    users[userIndex] = user;

    await db.push('users', users);

    return true;
}

async function findUser(
    filter: Partial<Record<userKeys, unknown>>
): Promise<userSchema | false> {
    const users = await db.getData('users');

    const keys = Object.keys(filter);
    const valid = keys.every((k) => userFields.safeParse(k).success);

    if (!valid) {
        return false;
    }

    const typedKeys = keys as userKeys[];

    const user = users.find((u) => {
        return typedKeys.every(
            (v) => u[v] === (filter as Record<userKeys, unknown>)[v]
        );
    });

    if (!user) return false;

    return user;
}

async function comparePasswords(hash: string, input: string) {
    const hashedPassword = await hashPassword(input);

    return hashedPassword === hash;
}
