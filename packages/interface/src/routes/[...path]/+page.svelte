<script>
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    let count = $state(5);

    if (browser)
        setInterval(() => {
            if (count > 0) count--;
            if (count === 0) goto('/');
        }, 1000);
</script>

<svelte:head>
    <title>Not found | Cadgate</title>
</svelte:head>

<div class="w-full h-screen flex items-center justify-center">
    <div
        class="w-3/4 h-3/4 rounded-xl bg-slate-800 flex flex-col p-8 items-center justify-center"
    >
        <div>
            <h1 class="text-5xl">Wow, you found an easter egg!</h1>
            <p class="text-2xl">Unforuntately, this is only a 404 page :/</p>

            <p>Redirecting in {count} Seconds...</p>
        </div>
    </div>
</div>
