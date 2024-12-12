import { Database } from '@/util/db/index.ts';
import { dbSchema } from '@/util/schemas/db.ts';
import { finderFactory } from '@/util/functions/factories/finder.ts';
import { filterFactory } from '@/util/functions/factories/filter.ts';
import { pushFactory } from '@/util/functions/factories/push.ts';
import { updateFactory } from '@/util/functions/factories/update.ts';
import { deleteFactory } from '@/util/functions/factories/delete.ts';

const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;

export const db = new Database(DATABASE_PATH, dbSchema);

export const userSchema = dbSchema.shape.users.element;
export const proxySchema = dbSchema.shape.proxyEntries.element;
export const redirectSchema = dbSchema.shape.redirectEntries.element;
export const passkeySchema = dbSchema.shape.passkeys.element;

export const findUser = finderFactory(
    async () => await db.getData('users'),
    userSchema
);
export const updateUser = updateFactory(
    async () => await db.getData('users'),
    async (d) => await db.push('users', d),
    userSchema
);

export const findProxy = finderFactory(
    async () => await db.getData('proxyEntries'),
    proxySchema
);
export const updateProxy = updateFactory(
    async () => await db.getData('proxyEntries'),
    async (d) => await db.push('proxyEntries', d),
    proxySchema
);
export const pushProxy = pushFactory(
    async () => await db.getData('proxyEntries'),
    async (d) => await db.push('proxyEntries', d),
    proxySchema
);
export const deleteProxy = deleteFactory(
    async () => await db.getData('proxyEntries'),
    async (d) => await db.push('proxyEntries', d),
    proxySchema
);

export const findRedirect = finderFactory(
    async () => await db.getData('redirectEntries'),
    redirectSchema
);
export const updateRedirect = updateFactory(
    async () => await db.getData('redirectEntries'),
    async (d) => await db.push('redirectEntries', d),
    redirectSchema
);
export const pushRedirect = pushFactory(
    async () => await db.getData('redirectEntries'),
    async (d) => await db.push('redirectEntries', d),
    redirectSchema
);
export const deleteRedirect = deleteFactory(
    async () => await db.getData('redirectEntries'),
    async (d) => await db.push('redirectEntries', d),
    redirectSchema
);

export const findPasskey = finderFactory(
    async () => await db.getData('passkeys'),
    passkeySchema
);
export const filterPasskey = filterFactory(
    async () => await db.getData('passkeys'),
    passkeySchema
);
export const updatePasskey = updateFactory(
    async () => await db.getData('passkeys'),
    async (d) => await db.push('passkeys', d),
    passkeySchema
);
export const pushPasskey = pushFactory(
    async () => await db.getData('passkeys'),
    async (d) => await db.push('passkeys', d),
    passkeySchema
);
export const deletePasskey = deleteFactory(
    async () => await db.getData('passkeys'),
    async (d) => await db.push('passkeys', d),
    passkeySchema
);
