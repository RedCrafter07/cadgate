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

    async createOrEdit(
        data: Omit<cloudflare.DNS.Records.RecordEditParams.ARecord, 'zone_id'>,
        zones?: Awaited<ReturnType<typeof this.getZones>>,
        dnsRecords?: Awaited<ReturnType<typeof this.getDnsRecords>>
    ) {
        if (!zones) {
            zones = await this.getZones();
        }

        const zone = this.getZoneForDomain(zones, data.name);

        if (!zone) return false;

        if (!dnsRecords) dnsRecords = await this.getDnsRecords([zone]);

        const record = dnsRecords.find(
            (r) => r.name === data.name && r.type === 'A'
        );

        if (record)
            return await this.client.dns.records.edit(record.id!, {
                ...data,
                zone_id: zone.id,
            });
        else
            return await this.client.dns.records.create({
                ...data,
                zone_id: zone.id,
            });
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

        const dnsRecords = await this.getDnsRecords(zones);

        await Promise.all(
            cfEntries.map(async (e) => {
                await this.createOrEdit({ type: 'A', ...e }, zones, dnsRecords);
            })
        );
    }

    getZoneForDomain(
        zones: Awaited<ReturnType<typeof this.getZones>>,
        url: string
    ) {
        const domain = this.getDomainNames(url)[0];

        return zones.find((z) => z.name === domain);
    }

    async getDnsRecords(
        zones: Awaited<ReturnType<typeof this.getZones>>,
        options: { forceComment: boolean } = { forceComment: false }
    ) {
        const dnsRecords = (
            await Promise.all(
                zones.map(
                    async (z) =>
                        (
                            await this.client.dns.records.list({
                                zone_id: z.id,
                                type: 'A',
                                comment: options.forceComment
                                    ? { exact: 'Cadgate Integration' }
                                    : undefined,
                            })
                        ).result
                )
            )
        ).flat();

        return dnsRecords;
    }

    async deleteDnsRecord(
        domain: string,
        zones?: Awaited<ReturnType<typeof this.getZones>>,
        dnsRecords?: Awaited<ReturnType<typeof this.getDnsRecords>>
    ) {
        if (!zones) zones = await this.getZones();

        const zone = this.getZoneForDomain(zones, domain);

        if (!zone) return false;

        if (!dnsRecords)
            dnsRecords = await this.getDnsRecords([zone], {
                forceComment: true,
            });

        const record = dnsRecords.find((r) => r.name === domain);

        if (!record) return false;

        await this.client.dns.records.delete(record.id!, { zone_id: zone.id });
    }

    getDomainNames(...domains: string[]) {
        return [
            ...new Set(domains.map((d) => d.split('.').slice(-2).join('.'))),
        ];
    }
}

export { Cloudflare };
