import addProxy from '$lib/api/functions/proxy/add.js';
import deleteProxy from '$lib/api/functions/proxy/delete.js';
import getProxies from '$lib/api/functions/proxy/getAll';
import updateProxy from '$lib/api/functions/proxy/update.js';
import { validate } from '$lib/jwt';
import { proxyEntries, type proxyEntry } from '$lib/schemas/proxyEntries';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
	const proxies = await getProxies();

	return { proxies };
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

		const success = await deleteProxy(validation.data);

		return {
			message: success
				? 'Successfully deleted Proxy!'
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
		let data = {};

		try {
			data = JSON.parse(formData.get('data')?.toString()!);
		} catch {
			return fail(400, {
				message: 'Invalid JSON data',
				success: false,
			});
		}

		const { tlsMode, cert, key, ...rest } = data as Record<string, any>;

		const allData: Partial<proxyEntry> = {
			...rest,
			tls: {
				mode: tlsMode,
				cert,
				key,
			},
		};

		if (id && id === 'new') {
			const validation = proxyEntries.element.safeParse({
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

			const success = await addProxy(data);

			return {
				message: success
					? 'Successfully added Proxy!'
					: 'Internal server error',
				success,
			};
		} else {
			const validation = proxyEntries.element.safeParse(allData);

			if (!validation.success) {
				return fail(400, {
					message: 'Invalid parameters were provided.',
					success: false,
				});
			}

			const { data } = validation;

			const success = await updateProxy(data);

			return {
				message: success
					? 'Successfully updated Proxy!'
					: 'Internal server error',
				success,
			};
		}
	},
};
