<script lang="ts">
    import IconCheck from '~icons/tabler/check';
    import IconX from '~icons/tabler/x';
    import IconPlus from '~icons/tabler/plus';
    import IconEdit from '~icons/tabler/edit';
    import IconTrash from '~icons/tabler/trash';
    import type { redirectEntry } from '$lib/schemas/redirectEntries.js';
    import Switch from '$lib/components/Switch.svelte';
    import { fade } from 'svelte/transition';
    import Picker from '$lib/components/Picker.svelte';
    import Input from '$lib/components/Input.svelte';
    import { enhance } from '$app/forms';

    const { data, form } = $props();

    const { redirects } = $derived(data);

    let popupID = $state<string | null>(null);
    let popupData: redirectEntry | {} | null = $derived(
        popupID === 'new'
            ? {}
            : redirects.find((p) => p.id === popupID) || null,
    );

    let loading = $state(false);

    $effect(() => {
        if (form?.success) {
            popupID = null;
        }
    });
</script>

<svelte:head>
    <title>Redirect Settings | Cadgate</title>
</svelte:head>

{#snippet popup(input: Partial<redirectEntry>)}
    <div
        transition:fade={{ duration: 150 }}
        class="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-25 backdrop-blur-md flex z-50"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="w-full h-full absolute top-0 left-0"
            onclick={() => {
                popupID = null;
            }}
        ></div>

        <div
            class="bg-slate-900 lg:rounded-xl p-8 w-full h-full lg:w-3/4 lg:h-max m-auto border-slate-600 lg:border drop-shadow-2xl flex flex-col gap-6"
        >
            <div class="flex flex-row justify-between">
                <h1 class="text-3xl">Redirect entry</h1>
                <button
                    class="btn btn-square"
                    onclick={() => {
                        popupID = null;
                    }}
                >
                    <IconX class="text-xl" />
                </button>
            </div>

            <form
                action={`?/update`}
                method="post"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }}
                class="flex flex-col gap-6"
            >
                <input type="text" name="id" class="hidden" value={popupID} />

                <Input
                    name="name"
                    placeholder="My website"
                    label="Display name"
                    value={input.name}
                />

                <Picker
                    label="Hosts"
                    name="hosts"
                    value={input.hosts}
                    placeholder="mycoolsite.example.com"
                />

                <Input
                    name="to"
                    placeholder="https://rickroll.link"
                    label="Redirect to"
                    value={input.to}
                />

                <Switch
                    name="preservePath"
                    label="Preserve path"
                    checked={input.preservePath}
                />
                <Switch
                    name="cloudflare"
                    label="Cloudflare Integration"
                    checked={input.cloudflare}
                />

                <button class="btn btn-outline btn-success" disabled={loading}>
                    {#if popupID === 'new'}
                        Add new Redirect!
                    {:else}
                        Update Redirect!
                    {/if}
                </button>
            </form>
        </div>
    </div>
{/snippet}

{#snippet createEntry()}
    <button
        class="btn btn-success btn-outline"
        onclick={() => {
            popupID = 'new';
        }}
    >
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

{#if popupID && popupData}
    {@render popup(popupData)}
{/if}

<div class="my-4"></div>

<div class="p-3 rounded-xl bg-slate-900">
    {#if form?.message}
        <div
            class="p-2 w-full rounded-xl"
            class:bg-green-500={form.success}
            class:bg-red-500={!form.success}
        >
            {form.message}
        </div>
    {/if}

    <div class="flex flex-row items-center justify-between mb-2">
        <h3 class="text-xl">Redirects</h3>
        <button
            class="btn btn-square"
            onclick={() => {
                popupID = 'new';
            }}
        >
            <IconPlus class="text-xl" />
        </button>
    </div>
    <table class="w-full table-auto">
        <thead>
            <tr>
                <td>Name</td>
                <td>To</td>
                <td>Hosts</td>
                <td>Preserve path</td>
                <td>Cloudflare integration</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {#each redirects as redirect}
                <tr>
                    <td>{redirect.name ?? redirect.to}</td>

                    <td>{redirect.to}</td>

                    <td class="flex flex-row gap-2">
                        {#each redirect.hosts as host}
                            <div class="px-2 py-1 rounded-xl bg-slate-800">
                                {host}
                            </div>
                        {/each}
                    </td>

                    <td>
                        {@render checkIcons(redirect.preservePath)}
                    </td>
                    <td>
                        {@render checkIcons(redirect.cloudflare)}
                    </td>

                    <td>
                        <div class="flex flex-row gap-2 items-center">
                            <button
                                class="btn btn-square"
                                onclick={() => {
                                    popupID = redirect.id;
                                }}
                            >
                                <IconEdit class="text-lg" />
                            </button>
                            <form
                                action="?/delete"
                                method="post"
                                use:enhance={() => {
                                    loading = true;
                                    return async ({ update }) => {
                                        await update();
                                        loading = false;
                                    };
                                }}
                            >
                                <input
                                    type="text"
                                    class="hidden"
                                    name="id"
                                    value={redirect.id}
                                />
                                <button
                                    class="btn btn-square"
                                    disabled={loading}
                                >
                                    <IconTrash class="text-lg" />
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="6" class="text-center">
                        <div
                            class="w-full flex flex-col gap-4 my-4 items-center justify-center"
                        >
                            <h3 class="text-xl">
                                No redirect entries yet! Why don't you create
                                one?
                            </h3>
                            <div class="mx-auto">{@render createEntry()}</div>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
