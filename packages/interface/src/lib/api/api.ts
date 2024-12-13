import axios from 'axios';
import { API_URL } from '$env/static/private';

const api = axios.create({
    baseURL: API_URL ?? 'http://localhost:2000',
});

export default api;
