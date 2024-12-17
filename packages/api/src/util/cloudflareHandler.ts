import { proxySchema, redirectSchema } from '@/api/src/util/db.ts';
import { z } from 'npm:zod';
import { db } from '@/api/src/util/db.ts';
import { Cloudflare } from '@/util/cloudflare.ts';

type schemas = z.infer<typeof proxySchema> | z.infer<typeof redirectSchema>;

export async function cloudflareHandler(
    data: schemas,
    action: 'create' | 'edit' | 'delete'
) {
    if (!data.cloudflare) return;

    const system = await db.getData('system');

    if (!system.cfEnabled) return;
    if (
        system.cfKey === undefined ||
        system.cfUseProxy === undefined ||
        system.ip === undefined
    )
        return;

    const cf = new Cloudflare({
        apiKey: system.cfKey,
        useProxy: system.cfUseProxy,
        serverIP: system.ip,
    });

    const zones = await cf.getZones();

    const dns = await cf.getDnsRecords(zones);

    switch (action) {
        case 'create':
        case 'edit':
            {
                await Promise.all(
                    data.hosts.map(async (h) => {
                        await cf.createOrEdit({ name: h }, zones, dns);
                    })
                );
            }
            break;

        case 'delete':
            await Promise.all(
                data.hosts.map(async (h) => {
                    await cf.deleteDnsRecord(h, zones, dns);
                })
            );
            break;
    }
}
