import api from '$lib/api/api';

export default async function getAccessURL(userID: string) {
	try {
		const res = await api.get('/system/accessURL', {
			headers: {
				uID: userID,
			},
		});

		return res.data as { accessURL: string | null };
	} catch {
		return false;
	}
}
