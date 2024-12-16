<script lang="ts">
    import { enhance } from '$app/forms';
    import type { RegistrationResponseJSON } from '@simplewebauthn/types';
    import type { ActionData, PageData } from './$types';
    import { startRegistration } from '@simplewebauthn/browser';
    import axios from 'axios';
    import IconTrash from '~icons/tabler/trash';
    import IconLogout from '~icons/tabler/logout';
    import IconMail from '~icons/tabler/mail';
    import IconLock from '~icons/tabler/lock';
    import IconX from '~icons/tabler/x';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import Switch from '$lib/components/Switch.svelte';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let deleteID = $state<string | null>(null);
    let passkeyRegistration = $state<
        | { type: 'none' }
        | { type: 'loading' }
        | { type: 'success' }
        | { type: 'error'; message: string }
    >({ type: 'none' });
    let showForcePasskeyPopup = $state(false);

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

{#snippet forcePasskeyPopup()}
    <div
        transition:fade={{ duration: 150 }}
        class="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-75 backdrop-blur-sm flex"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="absolute top-0 left-0 w-full h-full z-10"
            onclick={() => {
                showForcePasskeyPopup = false;
            }}
        ></div>
        <div
            class="bg-slate-900 lg:rounded-xl p-8 w-full h-full lg:w-3/4 lg:h-max m-auto border-slate-600 lg:border drop-shadow-2xl flex flex-col gap-4 z-20"
        >
            <div class="flex flex-row justify-between">
                <h1 class="text-3xl">Are you sure?</h1>

                <button
                    class="btn btn-square"
                    onclick={() => {
                        showForcePasskeyPopup = false;
                    }}
                >
                    <IconX class="text-xl" />
                </button>
            </div>

            <p>
                Enforcing passkeys for login may lead to account lockout if the
                passkey is not saved properly. If this happens, an Administrator
                will need to reset the setting. Are you sure you want to
                proceed?
            </p>

            <form
                action="?/forcekey"
                method="post"
                use:enhance={() => {
                    return async ({ update }) => {
                        await update();

                        showForcePasskeyPopup = false;
                    };
                }}
            >
                <input type="checkbox" name="force" checked class="hidden" />
                <button class="btn btn-error btn-outline">
                    I am 100% sure I want to do this.
                </button>
            </form>
        </div>
    </div>
{/snippet}

{#snippet deleteKeyPopup(id: string | null)}
    <div
        transition:fade={{ duration: 150 }}
        class="fixed top-0 left-0 w-full h-full bg-slate-900 bg-opacity-75 backdrop-blur-sm flex z-50"
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
            class="bg-slate-900 lg:rounded-xl p-8 w-full h-full lg:w-3/4 lg:h-max m-auto border-slate-600 lg:border drop-shadow-2xl flex flex-col gap-4 z-20"
        >
            <div class="flex flex-row justify-between">
                <h1 class="text-3xl">
                    Delete key {data.passkeys.find((k) => k.id === id)!.name}?
                </h1>

                <button
                    class="btn btn-square"
                    onclick={() => {
                        deleteID = null;
                    }}
                >
                    <IconX class="text-xl" />
                </button>
            </div>
            <h3 class="text-xl opacity-70">
                This action is not irreversible. You'll have to manually delete
                the passkey from your device afterwards.
            </h3>

            <form action="?/delkey" method="post" use:enhance>
                <input type="text" name="id" class="hidden" value={id} />

                <button class="btn btn-outline btn-error w-full">Yeetus!</button
                >
            </form>
        </div>
    </div>
{/snippet}

<div class="flex flex-col gap-8 mt-4">
    <div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
        <h3 class="text-2xl">Quick Access</h3>
        <div class="flex flex-row gap-4">
            <button
                class="btn btn-outline btn-error"
                onclick={() => {
                    goto('/logout');
                }}><IconLogout /> Log Out</button
            >
            <button
                class="btn btn-outline btn-warning"
                onclick={() => {
                    goto('/change-password');
                }}><IconLock /> Change Password</button
            >
            <button
                class="btn btn-outline btn-info"
                onclick={() => {
                    goto('/change-mail');
                }}><IconMail /> Change Mail</button
            >
        </div>
    </div>
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

        {#if data.passkeys.length > 0}
            <div class="flex flex-col gap-2">
                {#each data.passkeys as key}
                    <div
                        class="flex flex-row items-center justify-between gap-2"
                    >
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
    <div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
        <h3 class="text-2xl">Danger Zone</h3>
        <form
            action="?/forcekey"
            method="post"
            use:enhance={({ formData, cancel }) => {
                const force = formData.get('force') === 'on';

                if (force) {
                    showForcePasskeyPopup = true;
                    cancel();
                    return;
                }

                return async ({ update }) => {
                    await update();
                    showForcePasskeyPopup = false;
                };
            }}
            class="flex flex-row items-center justify-between gap-2"
        >
            <Switch
                name="force"
                label="Force Passkey Login"
                description="Disable login with Email and Password and only allow Passkeys"
                checked={data.user.forcePasskey}
            />
            <button class="btn btn-outline btn-info">Submit!</button>
        </form>
    </div>
</div>

{#if deleteID}
    {@render deleteKeyPopup(deleteID)}
{/if}
{#if showForcePasskeyPopup}
    {@render forcePasskeyPopup()}
{/if}
