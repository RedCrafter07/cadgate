<script lang="ts">
	import IconCheck from '~icons/tabler/check';
	import IconX from '~icons/tabler/x';
	import IconPlus from '~icons/tabler/plus';
	import IconEdit from '~icons/tabler/edit';
	import IconTrash from '~icons/tabler/trash';
	import type { proxyEntry } from '$lib/schemas/proxyEntries.js';
	import Switch from '$lib/components/Switch.svelte';
	import { fade } from 'svelte/transition';
	import Picker from '$lib/components/Picker.svelte';
	import Input from '$lib/components/Input.svelte';
	import { enhance } from '$app/forms';

	const { data, form } = $props();

	const { proxies } = $derived(data);

	let popupID = $state<string | null>(null);
	let popupData: proxyEntry | {} | null = $derived(
		popupID === 'new' ? {} : proxies.find((p) => p.id === popupID) || null,
	);

	type addStep = 'config' | 'failover' | 'tls';

	let loading = $state(false);
	let configStep = $state<addStep>('config');

	$effect(() => {
		if (form?.success) {
			popupID = null;
		}
	});
</script>

<svelte:head>
	<title>Reverse Proxy Settings | Cadgate</title>
</svelte:head>

{#snippet viewConfiguration()}{/snippet}
{#snippet viewFailover()}{/snippet}
{#snippet viewTLS()}{/snippet}

{#snippet popup(input: Partial<proxyEntry>, step: addStep)}
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
			class="bg-slate-900 lg:rounded-xl p-8 w-full h-full lg:w-3/4 lg:h-max m-auto border-slate-600 lg:border drop-shadow-2xl flex flex-col gap-6 overflow-hidden"
		>
			<div class="flex flex-row justify-between">
				<h1 class="text-3xl">Reverse Proxy entry</h1>
				<button
					class="btn btn-square"
					onclick={() => {
						popupID = null;
					}}
				>
					<IconX class="text-xl" />
				</button>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<button
					class="px-4 py-2 rounded-xl text-left bg-slate-800 transition-all duration-150"
					class:hover:bg-opacity-75={popupID !== 'new'}
					class:bg-opacity-50={step !== 'config'}
					onclick={() => {
						if (popupID === 'new') return;
						configStep = 'config';
					}}
				>
					1. General Config
				</button>
				<button
					class="px-4 py-2 rounded-xl text-left bg-slate-800 transition-all duration-150"
					class:hover:bg-opacity-75={popupID !== 'new'}
					class:bg-opacity-50={step !== 'failover'}
					onclick={() => {
						if (popupID === 'new') return;
						configStep = 'failover';
					}}
				>
					2. Failover
				</button>
				<button
					class="px-4 py-2 rounded-xl text-left bg-slate-800 transition-all duration-150"
					class:hover:bg-opacity-75={popupID !== 'new'}
					class:bg-opacity-50={step !== 'tls'}
					onclick={() => {
						if (popupID === 'new') return;
						configStep = 'tls';
					}}
				>
					3. TLS
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
					placeholder="http://localhost:4242"
					label="Forward Host"
					value={input.to}
				/>

				<Switch
					name="enforceHttps"
					label="Enforce HTTPS"
					checked={input.enforceHttps}
				/>
				<Switch
					name="cloudflare"
					label="Cloudflare Integration"
					checked={input.cloudflare}
				/>

				<button class="btn btn-outline btn-success" disabled={loading}>
					{#if popupID === 'new'}
						Add new Proxy!
					{:else}
						Update Proxy!
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
	{@render popup(popupData, configStep)}
{/if}

<div class="p-3 rounded-xl bg-slate-900 my-4">
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
		<h3 class="text-xl">Reverse Proxies</h3>
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
				<td>Enforce HTTPS</td>
				<td>Cloudflare integration</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			{#each proxies as proxy}
				<tr>
					<td>{proxy.name ?? proxy.to}</td>

					<td>{proxy.to}</td>

					<td class="flex flex-row gap-2">
						{#each proxy.hosts as host}
							<div class="px-2 py-1 rounded-xl bg-slate-800">
								{host}
							</div>
						{/each}
					</td>

					<td>
						{@render checkIcons(proxy.enforceHttps)}
					</td>
					<td>
						{@render checkIcons(proxy.cloudflare)}
					</td>

					<td>
						<div class="flex flex-row gap-2 items-center">
							<button
								class="btn btn-square"
								onclick={() => {
									popupID = proxy.id;
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
									value={proxy.id}
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
