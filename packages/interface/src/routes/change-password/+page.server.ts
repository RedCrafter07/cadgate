export const load = async ({ parent }) => {
    const data = await parent();

    const user = data.user!;
};
