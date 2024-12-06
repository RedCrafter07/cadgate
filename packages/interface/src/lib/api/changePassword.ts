import axios from 'axios';

export default async function changePassword(
    id: string,
    current: string,
    to: string
) {
    await axios.put('http://localhost:2000/user/password', {
        id,
        current,
        to,
    });
}
