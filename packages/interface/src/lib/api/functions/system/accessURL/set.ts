import api from '$lib/api/api';

export default async function setAccessURL(userID: string, accessURL: string) {
	try {
		await api.post('/system/accessURL', { uID: userID, accessURL });
		return true;
	} catch {
		return false;
	}
}
