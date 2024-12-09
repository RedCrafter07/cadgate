<script>
    import { enhance } from '$app/forms';
</script>

<svelte:head>
    <title>Change Mail | Cadgate</title>
</svelte:head>

<div class="mx-auto container p-2 lg:p-4 flex flex-col w-full gap-4">
    <div class="flex flex-col w-full gap-2">
        <h1 class="text-3xl">Change your email</h1>
        <h3 class="text-xl opacity-80">
            Seems like you're required to change your email. Do that using the
            input below!
        </h3>
        <p class="opacity-75">Please set it to a reachable email.</p>
    </div>

    <form class="flex flex-col w-full gap-4" method="post" use:enhance>
        <input type="email" name="mail" placeholder="New Mail" required />
        <button class="btn btn-success btn-outline">
            <span class="text-xl">Change it!</span>
        </button>
    </form>
</div>
