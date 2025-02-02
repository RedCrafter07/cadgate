import { z } from 'npm:zod';

const dbSchema = z.object({
    proxyEntries: z
        .object({
            tls: z
                .object({
                    mode: z.enum(['auto']),
                })
                .or(
                    z.object({
                        mode: z.enum(['file']),
                        key: z.string(),
                        cert: z.string(),
                    })
                )
                .optional()
                .default({ mode: 'auto' }),
            additionalHosts: z
                .object({
                    hosts: z
                        .string()
                        .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                            message:
                                'Invalid url. Please consider excluding "http(s)://" in front.',
                        })
                        .array(),
                    mode: z.enum(['failover', 'loadBalancing']),
                })
                .optional(),
            hosts: z
                .string()
                .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                    message:
                        'Invalid url. Please consider excluding "http(s)://" in front.',
                })
                .array()
                .default([])
                .describe('The hosts proxied to the "To" entry'),
            to: z
                .string()
                .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                    message:
                        'Invalid url. Please consider excluding "http(s)://" in front.',
                })
                .describe('The location the hosts are proxied to'),
            enforceHttps: z
                .boolean()
                .default(false)
                .describe('Enforce HTTPS to this endpoint'),
            cloudflare: z
                .boolean()
                .default(false)
                .describe(
                    'Integrate this endpoint with your CloudFlare Credentials'
                ),
            name: z.string().optional(),
            id: z
                .string()
                .default(() => crypto.randomUUID().split('-').join('')),
        })
        .array(),

    redirectEntries: z
        .object({
            tls: z
                .object({
                    mode: z.enum(['auto']),
                })
                .or(
                    z.object({
                        mode: z.enum(['file']),
                        key: z.string(),
                        cert: z.string(),
                    })
                )
                .optional()
                .default({ mode: 'auto' }),
            id: z
                .string()
                .default(() => crypto.randomUUID().split('-').join('')),
            name: z.string().optional(),
            cloudflare: z
                .boolean()
                .default(false)
                .describe(
                    'Integrate this endpoint with your CloudFlare Credentials'
                ),
            hosts: z
                .string()
                .regex(/^(?!https?:\/\/)(?=.*\..+)[^\s]+$/g, {
                    message:
                        'Invalid url. Please consider excluding "http(s)://" in front.',
                })
                .array()
                .default([])
                .describe('The hosts redirected to the "To" entry'),
            to: z.string().regex(/^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?$/, {
                message: 'Invalid hostname!',
            }),
            preservePath: z.boolean().default(false),
        })
        .array(),

    users: z
        .object({
            id: z
                .string()
                .describe('The ID of the user, used internally')
                .default(() => crypto.randomUUID().split('-').join('')),
            name: z.string().describe('The display name of the user'),
            email: z
                .string()
                .email()
                .describe(
                    "The user's email. May be used for fetching certificates"
                ),
            passwordHash: z.string(),
            administrator: z
                .boolean()
                .default(false)
                .describe('Gives full permission to everything'),
            requiresNewEmail: z.boolean().default(false),
            requiresNewPassword: z.boolean().default(false),
            challenge: z.string().or(z.null()).default(null),
            forcePasskey: z.boolean().default(false),
            isApiUser: z.boolean().default(false),
        })
        .array(),

    passkeys: z
        .object({
            name: z.string(),
            userID: z.string(),
            id: z.string(),
            publicKey: z.string(),
            counter: z.number(),
            transports: z
                .enum([
                    'ble',
                    'cable',
                    'hybrid',
                    'internal',
                    'nfc',
                    'smart-card',
                    'usb',
                ])
                .array()
                .or(z.undefined()),
            deviceType: z.enum(['singleDevice', 'multiDevice']),
            backedUp: z.boolean(),
        })
        .array(),

    system: z
        .object({
            ip: z.string().ip().optional(),
            cfKey: z.string().optional(),
            cfEnabled: z.boolean().default(false),
            cfUseProxy: z.boolean().optional(),
            tls: z
                .object({
                    email: z.string(),
                })
                .optional(),
            mainURL: z
                .string()
                .regex(
                    /^https?:\/\/(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost:\d+)$/g,
                    {
                        message:
                            'Invalid URL. URL must start with http:// or https://',
                    }
                )
                .optional()
                .default('http://localhost:3000'),
        })
        .default({ cfEnabled: false }),

    tlsCerts: z
        .object({
            id: z
                .string()
                .default(() => crypto.randomUUID().split('-').join('')),
            hosts: z.string().array(),
        })
        .array()
        .default([]),

    version: z.number().default(0.1),
});

export { dbSchema };
