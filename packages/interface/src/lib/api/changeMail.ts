import axios from 'axios';

export default async function changeMail(id: string, to: string) {
    await axios.put('http://localhost:2000/user/mail', {
        id,
        to,
    });
}
