<script lang="ts">
	import { enhance } from '$app/forms';
	import Switch from '$lib/components/Switch.svelte';

	const { data, form } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>System Settings | Cadgate</title>
</svelte:head>

<div class="flex flex-col gap-8">
	{#if form}
		<div
			class="p-2 rounded-xl"
			class:bg-red-500={!form.success}
			class:bg-green-500={form.success}
		>
			{form.message}
		</div>
	{/if}

	<div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
		<h1 class="text-2xl">Server Related Settings</h1>
		<p>IP Address</p>
		<form
			action="?/ip"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="flex flex-row gap-2 w-full"
		>
			<input
				class="w-full"
				type="text"
				name="ip"
				value={data.cloudflare.ip}
				placeholder="123.45.678.90"
			/>
			<button
				class="btn btn-outline btn-info"
				formaction="?/ip-auto"
				disabled
			>
				Auto
			</button>
			<button class="btn btn-outline btn-success">Save</button>
		</form>
	</div>

	<!-- <div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
        <h1 class="text-2xl">TLS Settings</h1>
        <p>Email to use for obtaining certs</p>
        <form
            action="?/tls-mail"
            method="post"
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update();
                    loading = false;
                };
            }}
            class="flex flex-row gap-2 w-full"
        >
            <input
                class="w-full"
                type="text"
                name="mail"
                placeholder="tls@example.com"
            />
            <button class="btn btn-outline btn-success">Save</button>
        </form>
    </div> -->

	<div class="flex flex-col p-4 gap-4 bg-slate-900 rounded-xl">
		<h1 class="text-2xl">CloudFlare Integration Settings</h1>

		<form
			action="?/cloudflare-enable"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="flex flex-col gap-4"
		>
			<Switch
				name="enable"
				label="Enable the Cadgate CloudFlare Integration"
				description="This will add your configuration to CloudFlare automatically. Please note that adding proxies may be slower because of this."
				checked={data.cloudflare.cfEnabled}
				disabled={data.cloudflare.cfKey === undefined ||
					data.cloudflare.cfUseProxy === undefined ||
					loading}
			/>
			<button
				class="btn btn-outline btn-success"
				disabled={data.cloudflare.cfKey === undefined ||
					data.cloudflare.cfUseProxy === undefined ||
					loading}>Save enabled</button
			>
		</form>

		<form
			action="?/cloudflare"
			method="post"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="flex flex-col gap-4 w-full"
		>
			<div class="flex flex-col gap-2">
				<p>Token</p>

				<input
					class="w-full"
					type="text"
					name="token"
					placeholder="iausdojnlxcknjalsijcpqaowcdmayszlckmaslycmapwos"
					value={data.cloudflare.cfKey || ''}
				/>
			</div>

			<Switch
				name="useProxy"
				label="Use Proxy Setting in CloudFlare"
				description="This will hide your real IP Address from potential attackers."
				checked={data.cloudflare.cfUseProxy}
			/>

			<button class="btn btn-outline btn-success" disabled={loading}>
				Save Data
			</button>
			<button
				class="btn btn-outline btn-error"
				formaction="?/cloudflare-del"
				disabled={loading}
			>
				Delete data
			</button>
		</form>
	</div>
</div>
