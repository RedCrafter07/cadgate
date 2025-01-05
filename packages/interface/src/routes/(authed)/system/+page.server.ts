import getAccessURL from '$lib/api/functions/system/accessURL/get';
import setAccessURL from '$lib/api/functions/system/accessURL/set.js';
import deleteCloudflare from '$lib/api/functions/system/cloudflare/delete.js';
import getCloudflare from '$lib/api/functions/system/cloudflare/get.js';
import cloudflareStatus from '$lib/api/functions/system/cloudflare/status.js';
import updateCloudflare from '$lib/api/functions/system/cloudflare/update.js';
import setIP from '$lib/api/functions/system/ip/set.js';
import { checkJwt } from '$lib/jwt/check.js';
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const jwt = await checkJwt(cookies);

	if (!jwt) {
		throw redirect(307, '/');
	}

	if (!jwt.user.administrator) {
		throw redirect(307, '/');
	}

	const cloudflareData = await getCloudflare(jwt.user.id);

	if (!cloudflareData)
		throw error(500, {
			message: 'Error while fetching IP and/or Cloudflare configuration',
		});

	const accessURLData = await getAccessURL(jwt.user.id);

	if (!accessURLData)
		throw error(500, {
			message: 'Error while fetching IP and/or Cloudflare configuration',
		});

	return { cloudflare: cloudflareData, accessURL: accessURLData.accessURL };
};

export const actions = {
	'access-url': async ({ cookies, request }) => {
		const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const accessURL = (await request.formData()).get('url')?.toString();

		if (!accessURL || accessURL.length < 1) {
			return fail(400, { message: 'Bad request', success: false });
		}

		const response = await setAccessURL(jwt.user.id, accessURL);

		if (!response) {
			return fail(500, { message: 'Internal Server Error' });
		}

		return { message: 'Success', success: true };
	},
	'ip-auto': async ({ cookies }) => {
		return error(500, { message: 'Not implemented.' });
		/* const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const ip = await autoIP(jwt.user.id);

		if (!ip) {
			return fail(500, { message: 'Internal server error' });
		}

		return { message: 'Success!', ip: ip.ip, success: true }; */
	},
	ip: async ({ cookies, request }) => {
		const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const ip = (await request.formData()).get('ip')?.toString();

		if (!ip) {
			return fail(400, { message: 'Invalid request', success: false });
		}

		const success = await setIP(jwt.user.id, ip);

		if (!success) {
			return fail(500, {
				message: 'Internal server error',
				success: false,
			});
		}

		return { message: 'Success', success: true };
	},
	cloudflare: async ({ cookies, request }) => {
		const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();

		const token = formData.get('token')?.toString();
		const useProxy = formData.get('useProxy')?.toString() === 'on';

		if (!token) {
			return fail(400, {
				message: 'Not all required parameters have been provided!',
			});
		}

		const success = await updateCloudflare(jwt.user.id, {
			apiKey: token,
			useProxy,
		});

		if (!success) {
			return fail(500, {
				message: 'Internal server error',
			});
		}

		return {
			message: 'Settings have been set successfully!',
			success: true,
		};
	},
	'cloudflare-enable': async ({ cookies, request }) => {
		const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const cfSettings = await getCloudflare(jwt.user.id);

		if (!cfSettings) {
			return error(500, { message: 'Internal server error' });
		}

		if (
			cfSettings.cfKey === undefined ||
			cfSettings.cfUseProxy === undefined
		) {
			return fail(400, {
				message: 'CloudFlare related settings have to be set first.',
				success: false,
			});
		}

		const enable =
			(await request.formData()).get('enable')?.toString() === 'on';

		const success = await cloudflareStatus(jwt.user.id, enable);

		if (!success) {
			return fail(500, {
				message: 'Internal server error',
				success: false,
			});
		}

		return {
			success: true,
			message: `The CloudFlare Integration has been ${
				enable ? 'enabled' : 'disabled'
			} successfully!`,
		};
	},
	'cloudflare-del': async ({ cookies }) => {
		const jwt = await checkJwt(cookies);

		if (!jwt) {
			return error(401, { message: 'Unauthorized' });
		}

		const success = await deleteCloudflare(jwt.user.id);

		if (!success) {
			return fail(500, { message: 'Internal server error' });
		}

		return {
			success: true,
			message: 'CloudFlare Settings have been deleted!',
		};
	},
};
