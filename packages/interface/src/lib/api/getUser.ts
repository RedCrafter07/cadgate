import axios from 'axios';
import { type User } from '$lib/schemas/user';

export default async function getUser(input: Partial<User>) {
    const userRequest = await axios
        .get('http://localhost:2000/user', {
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
