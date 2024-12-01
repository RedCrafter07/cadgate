// @deno-types="npm:@types/express"
import express from 'npm:express';
import { dbSchema } from '@/util/schemas/db.ts';
import { Database } from '@/util/db/index.ts';
import { z } from 'npm:zod';
import { encodeHex } from 'jsr:@std/encoding/hex';

const PORT = Deno.env.get('PORT') ?? 2000;
const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;

const app = express();

app.use(express.json());

const db = new Database(DATABASE_PATH, dbSchema);

app.get('/user', async (req, res) => {
	if (!req.params) {
		res.sendStatus(400);
		return;
	}

	const users = await db.getData('users');

	const userSchema = dbSchema.shape.users.element;
	const userFields = userSchema.keyof();

	const keys = Object.keys(req.params);
	const valid = keys.every((k) => userFields.safeParse(k).success);

	if (!valid) {
		res.sendStatus(400);
		return;
	}

	type userKeys = z.infer<typeof userFields>;
	const typedKeys = keys as userKeys[];

	const user = users.find((u) => {
		return typedKeys.every(
			(v) => u[v] === (req.params as Record<userKeys, unknown>)[v],
		);
	});

	if (!user) {
		res.sendStatus(404);
		return;
	}

	res.status(200).json(user);
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

	const pwBuffer = new TextEncoder().encode(data.password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', pwBuffer);
	const hashedPassword = encodeHex(hashBuffer);

	if (passwordHash === hashedPassword) {
		res.status(200).json({
			valid: true,
		});
	} else {
		res.status(200).json({
			valid: false,
		});
	}
});

app.listen(PORT, () => {
	console.log(`API Server started on Port ${PORT}!`);
});
