import axios from 'axios';
import { env } from '$env/dynamic/private';

const api = axios.create({
    baseURL: env.API_URL ?? 'http://localhost:2000',
});

export default api;
