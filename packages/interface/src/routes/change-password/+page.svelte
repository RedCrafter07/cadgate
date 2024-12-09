<script>
    import { enhance } from '$app/forms';

    let password1 = $state('');
    let password2 = $state('');
</script>

<svelte:head>
    <title>Change Password | Cadgate</title>
</svelte:head>

<div class="mx-auto container p-2 lg:p-4 flex flex-col w-full gap-4">
    <div class="flex flex-col w-full gap-2">
        <h1 class="text-3xl">Change your password</h1>
        <h3 class="text-xl opacity-80">
            Seems like you're required to change your password. Do that using
            the inputs below!
        </h3>
        <p class="opacity-75">Please make sure it is secure.</p>
    </div>

    <form class="flex flex-col w-full gap-4" method="post" use:enhance>
        <input
            type="password"
            name="currentPass"
            placeholder="Current Password"
            required
        />
        <input
            type="password"
            name="newPass"
            placeholder="New Password"
            value={password1}
            oninput={(e) => (password1 = e.currentTarget.value)}
            required
        />
        <input
            type="password"
            placeholder="Repeat New Password"
            value={password2}
            oninput={(e) => (password2 = e.currentTarget.value)}
            required
        />
        <button
            class="btn btn-success btn-outline"
            disabled={password1 !== password2 || password1.length < 1}
        >
            <span class="text-xl">Change it!</span>
        </button>
    </form>
</div>
