import { type User } from '$lib/schemas/user';
import api from '../../api';

export default async function getUser(input: Partial<User>) {
    const userRequest = await api
        .get('/user', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'GET',
            params: input,
        })
        .catch(() => {
            throw new Error();
        });

    const requestData = userRequest.data as User;

    return requestData;
}
