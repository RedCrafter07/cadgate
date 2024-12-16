import cloudflare from 'npm:cloudflare';
import { dbSchema } from './schemas/db.ts';
import { z } from 'npm:zod';

type proxySchema = z.infer<typeof dbSchema.shape.proxyEntries.element>;
type redirectSchema = z.infer<typeof dbSchema.shape.redirectEntries.element>;

class Cloudflare {
    useProxy: boolean;
    serverIP: string;
    client: cloudflare;

    constructor(config: {
        apiKey: string;
        useProxy: boolean;
        serverIP: string;
    }) {
        this.useProxy = config.useProxy;
        this.serverIP = config.serverIP;

        this.client = new cloudflare({
            apiToken: config.apiKey,
        });
    }

    async getZones() {
        const zones = await this.client.zones.list();

        const mapped = zones.result.map((z) => ({
            name: z.name,
            id: z.id,
        }));

        return mapped;
    }

    async createFromConfig({
        proxies,
        redirects,
    }: {
        proxies: proxySchema[];
        redirects: redirectSchema[];
    }) {
        const entries = [...proxies, ...redirects];

        const domains = this.getDomainNames(
            ...entries.map((e) => e.hosts).flat()
        );

        const zones = await this.getZones();

        const availableDomains = domains.filter((d) =>
            zones.map((z) => z.name).includes(d)
        );

        const cfEntries = entries
            .filter((e) => e.cloudflare)
            .map((e) =>
                e.hosts.map((h) => ({
                    proxied: this.useProxy,
                    content: this.serverIP,
                    name: h,
                    comment: 'Cadgate Integration',
                }))
            )
            .flat()
            .filter((e) =>
                availableDomains.includes(this.getDomainNames(e.name)[0])
            );

        const dnsRecords = (
            await Promise.all(
                zones.map(
                    async (z) =>
                        (
                            await this.client.dns.records.list({
                                zone_id: z.id,
                            })
                        ).result
                )
            )
        ).flat();

        await Promise.all(
            cfEntries.map(async (e) => {
                const zone = zones.find(
                    (z) => z.name === this.getDomainNames(e.name)[0]
                )!;

                const record = dnsRecords.find(
                    (r) => r.name === e.name && r.type === 'A'
                );

                if (record)
                    await this.client.dns.records.edit(record.id!, {
                        zone_id: zone.id,
                        ...e,
                        type: 'A',
                    });
                else
                    await this.client.dns.records.create({
                        zone_id: zone.id,
                        type: 'A',
                        ...e,
                    });
            })
        );
    }

    async getDnsRecords(zones: Awaited<ReturnType<typeof this.getZones>>) {
        const dnsRecords = (
            await Promise.all(
                zones.map(
                    async (z) =>
                        (
                            await this.client.dns.records.list({
                                zone_id: z.id,
                            })
                        ).result
                )
            )
        ).flat();

        return dnsRecords;
    }

    getDomainNames(...domains: string[]) {
        return [
            ...new Set(domains.map((d) => d.split('.').slice(-2).join('.'))),
        ];
    }
}

export { Cloudflare };
