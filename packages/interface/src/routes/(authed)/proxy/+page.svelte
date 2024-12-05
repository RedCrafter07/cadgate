<script lang="ts">
    import IconCheck from '~icons/tabler/check';
    import IconX from '~icons/tabler/x';
    import IconPlus from '~icons/tabler/plus';
    import { z } from 'zod';
    import { proxyEntries } from '$lib/schemas/proxyEntries.js';

    type proxyEntry = z.infer<typeof proxyEntries.element>;

    const { data } = $props();

    const { proxies } = $derived(data);
</script>

{#snippet popup(input: Partial<proxyEntry>)}
    <div
        class="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-25 backdrop-blur-md flex"
    >
        <div
            class="bg-slate-900 rounded-xl p-8 w-3/4 h-3/4 m-auto border-slate-600 border drop-shadow-2xl flex flex-col gap-4"
        >
            <h1 class="text-3xl">Proxy entry</h1>

            <input
                type="text"
                name=""
                class="w-full"
                placeholder="Display Name"
                value={input.name}
            />
        </div>
    </div>
{/snippet}

{#snippet createEntry()}
    <button class="btn btn-success btn-outline">
        <IconPlus class="text-2xl" />
        <p>Add entry</p>
    </button>
{/snippet}

{#snippet checkIcons(condition: boolean)}
    {#if condition}
        <IconCheck />
    {:else}
        <IconX />
    {/if}
{/snippet}

<div class="my-4"></div>

<div class="p-3 rounded-xl bg-slate-900">
    <table class="w-full table-auto">
        <thead>
            <tr>
                <td>Name</td>
                <td>To</td>
                <td>Hosts</td>
                <td>Enforce HTTPS</td>
                <td>Cloudflare integration</td>
            </tr>
        </thead>
        <tbody>
            {#each proxies as proxy}
                <tr>
                    <td>{proxy.name ?? proxy.to}</td>

                    <td>{proxy.to}</td>

                    <td class="flex flex-row gap-2">
                        {#each proxy.hosts as host}
                            <div class="p-1 rounded-xl bg-slate-800">
                                {host}
                            </div>
                        {/each}
                    </td>

                    <td>
                        {@render checkIcons(proxy.enforceHttps)}
                    </td>
                    <td>{@render checkIcons(proxy.cloudflare)}</td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5" class="text-center">
                        <div
                            class="w-full flex flex-col gap-4 my-4 items-center justify-center"
                        >
                            <h3 class="text-xl">
                                No proxy entries yet! Why don't you create one?
                            </h3>
                            <div class="mx-auto">{@render createEntry()}</div>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
