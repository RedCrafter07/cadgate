import { z } from 'zod';

export const passkeys = z
    .object({
        name: z.string(),
        userID: z.string(),
        id: z.string(),
        publicKey: z.any(),
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
    .array();

export type DbPasskeys = z.infer<typeof passkeys>;
