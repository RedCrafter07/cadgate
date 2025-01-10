export function envToBoolean(key: string) {
    return (Deno.env.get(key) ?? 'false') === 'true';
}
