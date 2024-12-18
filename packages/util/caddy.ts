import axios from 'npm:axios';
import { dbSchema } from './schemas/db.ts';
import { z } from 'npm:zod';

const proxySchema = dbSchema.shape.proxyEntries.element;
const redirectSchema = dbSchema.shape.redirectEntries.element;

type proxySchema = z.infer<typeof proxySchema>;
type redirectSchema = z.infer<typeof redirectSchema>;

const caddy = axios.create({
    baseURL: 'http://localhost:2019',
    headers: { 'Content-Type': 'application/json' },
});

export async function getAll() {
    const res = await caddy.get('/config');

    return res.data;
}

export async function initialize(
    ports: { https: number; http: number } = { https: 443, http: 80 }
) {
    const caddyServers = {
        cadgate: {
            '@id': 'cadgate.main',
            listen: [`:${ports.https}`],
            routes: [],
        },
        cadgateHttpFallback: {
            '@id': 'cadgate.http',
            listen: [`:${ports.http}`],
            routes: [],
        },
    };

    const caddyData = {
        apps: {
            http: {
                servers: caddyServers,
            },
        },
        storage: {
            module: 'file_system',
            root: '/data/caddy',
        },
    };

    try {
        await caddy.put('/config/', caddyData);
    } catch (error) {
        console.error('Error while initializing:', error);
    }
}

export async function resetConfig() {
    await caddy.delete('/config');
    await caddy.post('/config', {});
}

export async function createFromConfig(config: {
    redirectEntries: redirectSchema[];
    proxyEntries: proxySchema[];
}) {
    for (const entry of config.proxyEntries) {
        await createProxyRoute(entry);
    }

    for (const entry of config.redirectEntries) {
        await createRedirectRoute(entry);
    }
}

export async function deleteRedirectRoute(id: string) {
    const { httpsID, httpID } = formatID('redirect', id);

    await caddy.delete(`/id/${httpsID}`);
    await caddy.delete(`/id/${httpID}`);
}

export async function deleteProxyRoute(id: string) {
    const { httpsID, httpID } = formatID('proxy', id);

    await caddy.delete(`/id/${httpsID}`);
    await caddy.delete(`/id/${httpID}`);
}

export async function createRedirectRoute(entry: redirectSchema) {
    const { httpsID, httpID } = formatID('redirect', entry.id);

    await findOrCreateRoute('main', httpsID);
    await findOrCreateRoute('http', httpID);

    const handler = createRedirectHandler({
        to: entry.to,
        hosts: entry.hosts,
        preservePath: entry.preservePath,
    });

    await updateRoute(httpsID, handler);
    await updateRoute(httpID, handler);
}

export async function updateRedirectRoute({
    id,
    hosts,
    to,
    preservePath,
}: redirectSchema) {
    const { httpsID, httpID } = formatID('redirect', id);

    const handler = createRedirectHandler({ to, hosts, preservePath });

    await updateRoute(httpsID, handler);
    await updateRoute(httpID, handler);
}

export async function updateProxyRoute({
    id,
    to,
    hosts,
    enforceHttps,
}: proxySchema) {
    const { httpsID, httpID } = formatID('proxy', id);

    const httpsHandler = createHttpsProxyHandler({
        to: to,
        hosts: hosts,
    });
    await updateRoute(httpsID, httpsHandler);

    const httpHandler = createHttpProxyHandler(
        { enforceHttps, hosts },
        httpsHandler.handle
    );
    await updateRoute(httpID, httpHandler);
}

export async function createProxyRoute(entry: proxySchema) {
    const { httpID, httpsID } = formatID('proxy', entry.id);

    await findOrCreateRoute('main', httpsID);
    await findOrCreateRoute('http', httpID);

    const httpsHandler = createHttpsProxyHandler({
        to: entry.to,
        hosts: entry.hosts,
    });
    await updateRoute(httpsID, httpsHandler);

    const httpHandler = createHttpProxyHandler(
        { enforceHttps: entry.enforceHttps, hosts: entry.hosts },
        httpsHandler.handle
    );
    await updateRoute(httpID, httpHandler);
}

function createRedirectHandler(entry: {
    hosts: string[];
    to: string;
    preservePath: boolean;
}) {
    const handler = {
        match: [
            {
                host: entry.hosts,
            },
        ],
        handle: [
            {
                handler: 'static_response',
                headers: {
                    Location: [
                        `${entry.to}${
                            entry.preservePath ? '{http.request.uri}' : ''
                        }`,
                    ],
                },
                status_code: 307,
            },
        ],
    };

    return handler;
}

function createHttpProxyHandler(
    { enforceHttps, hosts }: { enforceHttps: boolean; hosts: string[] },
    handler: {
        handler: string;
        upstreams: { dial: string }[];
    }[]
) {
    if (!enforceHttps)
        return {
            match: [
                {
                    host: hosts,
                },
            ],
            handle: handler,
        };

    const redirectHandler = {
        match: [
            {
                host: hosts,
            },
        ],
        handle: [
            {
                handler: 'static_response',
                headers: {
                    Location: hosts.map(
                        (a) => `https://${a}{http.request.uri}`
                    ),
                },
                status_code: 307,
            },
        ],
    };

    return redirectHandler;
}

function createHttpsProxyHandler(data: { hosts: string[]; to: string }) {
    const handler = {
        match: [
            {
                host: data.hosts,
            },
        ],
        handle: [
            {
                handler: 'reverse_proxy',
                upstreams: [
                    {
                        dial: data.to,
                    },
                ],
            },
        ],
    };

    return handler;
}

async function findOrCreateRoute(type: 'main' | 'http', fullID: string) {
    const existingRoutes = await caddy.get<
        (ReturnType<typeof createHttpProxyHandler> & { '@id': string })[]
    >(`/id/cadgate.${type}/routes`);
    if (existingRoutes.data.some((route) => route['@id'] === fullID)) {
        return existingRoutes.data.find((route) => route['@id'] === fullID);
    }

    await caddy.post(`/id/cadgate.${type}/routes/`, { '@id': fullID });
    return await caddy.get(`/id/${fullID}`);
}

async function updateRoute<T>(id: string, data: T) {
    try {
        await caddy.patch(`/id/${id}`, { ...data, '@id': id });
    } catch (e) {
        console.error('Error while updating route:', e);
    }
}

function formatID(type: 'redirect' | 'proxy' | 'fallback', id: string) {
    const formattedID = `${type}.${id}`;

    const httpsID = `https.${formattedID}`;
    const httpID = `http.${formattedID}`;

    return {
        httpsID,
        httpID,
    };
}
