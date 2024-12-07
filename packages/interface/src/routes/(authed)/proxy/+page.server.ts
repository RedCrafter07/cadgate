import getProxies from '$lib/api/functions/proxy/getAll';

export const load = async () => {
    const proxies = await getProxies();

    return { proxies };
};
