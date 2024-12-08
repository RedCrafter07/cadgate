<script lang="ts">
    import IconCat from '~icons/tabler/cat';

    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
    <title>Login | Cadgate</title>
</svelte:head>

<div class="w-full h-screen flex items-center justify-center bg-slate-950">
    <div
        class="w-full h-full md:h-3/4 md:w-3/4 bg-slate-900 md:rounded-xl flex flex-col lg:flex-row gap-4 justify-center lg:justify-start lg:gap-12 p-8"
    >
        <div
            class="lg:flex-1 flex flex-col text-center items-center justify-center"
        >
            <IconCat
                class="text-[4rem] lg:hidden text-slate-400 mx-auto pb-4"
            />
            <h1 class="text-3xl xl:text-5xl">Welcome!</h1>
            <h3 class="text-xl xl:text-2xl">Please log in to use Cadgate.</h3>
        </div>
        <div class="h-full bg-slate-50 w-px opacity-10 hidden lg:block"></div>
        <div class="lg:flex-1 flex">
            <form
                class="flex flex-col gap-4 w-full my-auto"
                method="post"
                use:enhance
            >
                <IconCat
                    class="hidden lg:block lg:text-[6rem] text-slate-400 mx-auto pb-4"
                />
                {#if form && !form.success && form.message}
                    <p class="text-center bg-red-500 rounded-lg p-2">
                        {form.message}
                    </p>
                {/if}
                <input
                    tabindex="0"
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={form?.mail ?? ''}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                />
                <button
                    class="w-full bg-violet-500 text-slate-800 rounded-xl p-4 focus:scale-105 focus:outline-none transition-all duration-100"
                    >Log in!</button
                >
            </form>
        </div>
    </div>
</div>
