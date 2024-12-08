import { z, ZodObject } from 'npm:zod';

export function deleteFactory<
    D extends z.infer<S>,
    // deno-lint-ignore no-explicit-any
    S extends ZodObject<any>
>(
    callback: () => Promise<D[]>,
    write: (data: D[]) => Promise<void>,
    schema: S
) {
    type keys = keyof D;

    return async function (filter: Partial<D>) {
        const data = await callback();

        const keys = Object.keys(filter);
        const valid = keys.every((k) => schema.keyof().safeParse(k).success);

        const typedKeys = keys as keys[];

        if (!valid) {
            return false;
        }

        const index = data.findIndex((e) => {
            return typedKeys.every((v) => e[v] === filter[v]);
        });
        if (index < 0) return false;

        data.splice(index, 1);

        await write(data);
    };
}
