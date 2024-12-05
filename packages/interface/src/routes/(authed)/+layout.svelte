<script lang="ts">
    import { goto } from '$app/navigation';
    import IconUser from '~icons/tabler/user-circle';
    import IconUsers from '~icons/tabler/users';
    import IconSettings from '~icons/tabler/settings';
    import IconDirections from '~icons/tabler/directions';
    import IconRoute from '~icons/tabler/route';
    import IconHome from '~icons/tabler/home';
    import IconCat from '~icons/tabler/cat';
    import IconLogout from '~icons/tabler/logout';

    const { children, data } = $props();

    const user = $derived(data.user);
</script>

<div class="flex flex-col bg-slate-800 min-h-screen">
    <div
        class="h-16 bg-slate-900 border-b border-slate-700 flex flex-row items-center lg:justify-start justify-evenly p-4 gap-2 fixed bottom-0 lg:top-0 w-full"
    >
        <a href="/" class="mr-8 flex-row gap-2 hidden lg:flex"
            ><IconCat class="text-lg opacity-90" />
            <span class="lg:block hidden">Cadgate</span></a
        >
        <a href="/" class="btn"
            ><IconHome class="text-lg opacity-90" />
            <span class="lg:block hidden">Home</span></a
        >
        <a href="/proxy" class="btn"
            ><IconRoute class="text-lg opacity-90" />
            <span class="lg:block hidden">Proxy</span></a
        >
        <a href="/redirect" class="btn"
            ><IconDirections class="text-lg opacity-90" />
            <span class="lg:block hidden">Redirect</span></a
        >
        <a href="/system" class="btn"
            ><IconSettings class="text-lg opacity-90" />
            <span class="lg:block hidden">System</span></a
        >

        {#if user?.administrator}
            <div class="lg:block hidden">
                <button class="btn" disabled>
                    <IconUsers class="my-auto" />
                    <p class="my-auto">Users</p>
                    <span
                        class="px-2 py-1 rounded-full bg-yellow-300 text-yellow-950 text-sm my-auto"
                    >
                        Soon!
                    </span>
                </button>
            </div>
        {/if}

        <div class="lg:ml-auto">
            <button
                class="btn"
                title="Sign out"
                onclick={() => {
                    goto('/logout');
                }}
            >
                <span class="hidden lg:flex flex-row gap-2">
                    <IconUser class="text-xl" />
                    <p>Logged in as {user!.name}</p>
                </span>
                <span class="block lg:hidden">
                    <IconLogout class="text-xl" />
                </span>
            </button>
        </div>
    </div>
    <!-- Desktop spacer -->
    <div class="lg:block hidden h-16"></div>

    <div class="container mx-auto p-2">
        {@render children()}
    </div>

    <!-- Mobile spacer -->
    <div class="lg:hidden block h-16"></div>
</div>
