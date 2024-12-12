import addRedirect from '$lib/api/functions/redirect/add.js';
import deleteRedirect from '$lib/api/functions/redirect/delete.js';
import getRedirects from '$lib/api/functions/redirect/getAll.js';
import updateRedirect from '$lib/api/functions/redirect/update.js';
import { validate } from '$lib/jwt';
import {
    redirectEntries,
    type redirectEntry,
} from '$lib/schemas/redirectEntries.js';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
    const redirects = await getRedirects();

    return { redirects };
};

export const actions = {
    delete: async ({ cookies, request }) => {
        const token = cookies.get('token')!;

        try {
            await validate(token);
        } catch {
            return fail(401, {
                message: 'Invalid credentials. Please re-login and try again.',
                success: false,
            });
        }

        const id = (await request.formData()).get('id');

        const validation = z.string().safeParse(id);

        if (!validation.success) {
            return fail(400, {
                message: 'Invalid parameters',
                success: false,
            });
        }

        const success = await deleteRedirect(validation.data);

        return {
            message: success
                ? 'Successfully deleted Redirect!'
                : 'Internal server error',
            success,
        };
    },
    update: async ({ cookies, request }) => {
        const token = cookies.get('token')!;

        try {
            await validate(token);
        } catch {
            return fail(401, {
                message: 'Invalid credentials. Please re-login and try again.',
                success: false,
            });
        }

        const formData = await request.formData();

        const id = formData.get('id')?.toString();
        const name = formData.get('name')?.toString();
        const hosts = formData.getAll('hosts')?.toString().split(',');
        const to = formData.get('to')?.toString();
        const enforceHttps = formData.get('enforceHttps')?.toString() === 'on';
        const cloudflare = formData.get('cloudflare')?.toString() === 'on';

        const allData: Partial<redirectEntry> = {
            name,
            id,
            hosts,
            to,
            enforceHttps,
            cloudflare,
        };

        if (id && id === 'new') {
            const validation = redirectEntries.element.safeParse({
                ...allData,
                id: undefined,
            });

            if (!validation.success) {
                return fail(400, {
                    message: 'Invalid parameters were provided.',
                    success: false,
                });
            }

            const { data } = validation;

            const success = await addRedirect(data);

            return {
                message: success
                    ? 'Successfully added Redirect!'
                    : 'Internal server error',
                success,
            };
        } else {
            const validation = redirectEntries.element.safeParse(allData);

            if (!validation.success) {
                return fail(400, {
                    message: 'Invalid parameters were provided.',
                    success: false,
                });
            }

            const { data } = validation;

            const success = await updateRedirect(data);

            return {
                message: success
                    ? 'Successfully updated Redirect!'
                    : 'Internal server error',
                success,
            };
        }
    },
};
