// @deno-types="npm:@types/express"
import express from 'npm:express';
import { z } from 'npm:zod';

import { dbSchema } from '@/util/schemas/db.ts';
import { Database } from '@/util/db/index.ts';
import { hashPassword } from '@/util/functions/hashPassword.ts';

const PORT = Deno.env.get('PORT') ?? 2000;
const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;

const app = express();

app.use(express.json());

const db = new Database(DATABASE_PATH, dbSchema);

app.get('/proxy', async (_, res) => {
    const proxyEntries = await db.getData('proxyEntries');

    res.status(200).json(proxyEntries);
});

app.get('/user', async (req, res) => {
    if (!req.params) {
        res.sendStatus(400);
        return;
    }

    const { params } = req;

    const user = await findUser(params as any);

    if (user === false) {
        res.sendStatus(404);
        return;
    }

    res.status(200).json(user);
});

app.put('/user/password', async (req, res) => {
    const requestSchema = z.object({
        id: z.string(),
        current: z.string(),
        to: z.string(),
    });

    const validation = requestSchema.safeParse(req.body);

    if (!validation.success) {
        res.sendStatus(400);
        return;
    }

    const { data } = validation;

    const user = await findUser({ id: data.id });

    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (!(await comparePasswords(user.passwordHash, data.current))) {
        res.sendStatus(401);
        return;
    }

    if (user.requiresNewPassword) user.requiresNewPassword = false;

    const passwordHash = await hashPassword(data.to);

    const success = await updateUser(user.id, {
        ...user,
        passwordHash,
    });

    if (!success) {
        res.sendStatus(500);
        return;
    }

    res.sendStatus(200);
});

app.put('/user/email', async (req, res) => {});

app.put('/user/passChange', async (req, res) => {
    const { change } = req.body;
    const { user: userFilter } = req.body;

    const user = await findUser(userFilter);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    const success = await updateUser(user.id, { requiresNewPassword: change });

    res.status(200).json({ success });
});

app.put('/user/mailChange', async (req, res) => {
    const { change } = req.body;
    const { user: userFilter } = req.body;

    const user = await findUser(userFilter);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    const success = await updateUser(user.id, { requiresNewEmail: change });

    res.status(200).json({ success });
});

app.post('/users/validate', async (req, res) => {
    const bodySchema = z.object({
        id: z.string(),
        password: z.string(),
    });

    const validation = bodySchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json(validation.error);
        return;
    }

    const { data } = validation;

    const user = (await db.getData('users')).find((u) => u.id === data.id);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    const { passwordHash } = user;

    const passwordMatch = await comparePasswords(passwordHash, data.password);

    if (passwordMatch) {
        res.status(200).json({
            valid: true,
        });
    } else {
        res.status(200).json({
            valid: false,
        });
    }
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

app.listen(PORT, () => {
    console.log(`API Server started on Port ${PORT}!`);
});
