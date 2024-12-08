<script lang="ts">
    import { enhance } from '$app/forms';
    import type { RegistrationResponseJSON } from '@simplewebauthn/types';
    import type { ActionData, PageData } from './$types';
    import { startRegistration } from '@simplewebauthn/browser';
    import axios from 'axios';
    import IconTrash from '~icons/tabler/trash';
    import IconRefresh from '~icons/tabler/refresh';
    import IconX from '~icons/tabler/x';
    import IconCheck from '~icons/tabler/check';
    import { fly } from 'svelte/transition';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let deleteID = $state<string | null>(null);
    let passkeyRegistration = $state<
        | { type: 'none' }
        | { type: 'loading' }
        | { type: 'success' }
        | { type: 'error'; message: string }
    >({ type: 'none' });

    $effect(() => {
        form;
        deleteID = null;

        if (form?.options) {
            passkeyRegistration = { type: 'loading' };

            (async () => {
                let attResp: RegistrationResponseJSON;

                try {
                    attResp = await startRegistration({
                        optionsJSON: form.options,
                    });
                } catch (e) {
                    passkeyRegistration = {
                        type: 'error',
                        message: e as string,
                    };
                    return;
                }

                const res = await axios.post('/passkey/register', {
                    response: attResp,
                    name: form.name!,
                });

                const { success } = res.data;

                if (success) passkeyRegistration = { type: 'success' };
                else
                    passkeyRegistration = {
                        type: 'error',
                        message: 'Validation error',
                    };
            })();
        }
    });
</script>

<svelte:head>
    <title>User Settings | Cadgate</title>
</svelte:head>

{#snippet deleteKeyPopup(id: string | null)}
    <div
        class="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-75 backdrop-blur-sm flex"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="absolute top-0 left-0 w-full h-full z-10"
            onclick={() => {
                deleteID = null;
            }}
        ></div>
        <div
            class="w-3/4 lg:w-1/2 h-max rounded-xl bg-slate-800 p-8 m-auto flex flex-col gap-4 z-20"
        >
            <h1 class="text-3xl">
                Delete key {data.passkeys.find((k) => k.id === id)!.name}?
            </h1>
            <h3 class="text-xl opacity-70">
                This action is not irreversible. You'll have to manually delete
                the passkey from your device afterwards.
            </h3>

            <form action="?/delkey" method="post" use:enhance>
                <input type="text" name="id" class="hidden" value={id} />

                <button class="btn btn-outline btn-error w-full justify-center"
                    >Yeetus!</button
                >
            </form>
        </div>
    </div>
{/snippet}

<div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
    <form
        action="?/register"
        method="post"
        use:enhance
        class="flex flex-col gap-4"
    >
        <h3 class="text-2xl">WebAuthn</h3>
        <div class="flex flex-row gap-2">
            <input
                name="name"
                type="text"
                class="flex-1"
                placeholder="Display Name"
                required
            />
            <button
                class="btn"
                disabled={passkeyRegistration.type === 'loading'}
            >
                Setup WebAuthn
            </button>
        </div>
    </form>

    {#if deleteID}
        {@render deleteKeyPopup(deleteID)}
    {/if}

    {#if data.passkeys.length > 0}
        <div class="flex flex-col gap-2">
            {#each data.passkeys as key}
                <div class="flex flex-row items-center justify-between gap-2">
                    <p class="text-lg">{key.name}</p>

                    <button
                        class="btn btn-square"
                        onclick={() => {
                            deleteID = key.id;
                        }}
                    >
                        <IconTrash class="text-lg text-red-500" />
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>
