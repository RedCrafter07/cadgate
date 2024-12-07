import { z, ZodObject } from 'npm:zod';

export function pushFactory<
    D extends z.infer<S>,
    // deno-lint-ignore no-explicit-any
    S extends ZodObject<any>
>(get: () => Promise<D[]>, write: (data: D[]) => Promise<void>, schema: S) {
    return async function (input: D) {
        const validation = schema.safeParse(input);
        if (!validation.success) return false;

        const { data } = validation;

        const el = await get();

        el.push(data as unknown as D);

        await write(el);

        return true;
    };
}
