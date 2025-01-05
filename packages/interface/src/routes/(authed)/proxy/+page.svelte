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
	import { applyAction, deserialize, enhance } from '$app/forms';
	import HeightTransition from '$lib/components/HeightTransition.svelte';
	import axios from 'axios';
	import { invalidateAll } from '$app/navigation';

	const { data, form } = $props();

	const { proxies } = $derived(data);

	let popupID = $state<string | null>(null);
	let popupData: proxyEntry | {} | null = $derived(
		popupID === 'new' ? {} : proxies.find((p) => p.id === popupID) || null,
	);

	let updatedPopupData = $state<Partial<proxyEntry> | undefined>();
	let tlsMode = $state<'auto' | 'file'>();

	$effect(() => {
		if (updatedPopupData !== undefined || !popupData) return;
		updatedPopupData = popupData;

		tlsMode = updatedPopupData.tls?.mode;
	});

	type addStep = 'config' | 'failover' | 'tls';

	let loading = $state(false);
	let configStep = $state<addStep>('config');

	$effect(() => {
		if (form?.success) {
			if (popupID === 'new') popupID = null;
		}
	});

	function handleUpdate(fields: {
		text?: string[];
		checkbox?: string[];
		multiText?: string[];
		file?: string[];
		currentView: addStep;
	}) {
		async function getData<
			T extends {
				text?: string[];
				checkbox?: string[];
				multiText?: string[];
				file?: string[];
			},
		>(data: T, formData: FormData): Promise<any> {
			const textFields = (data.text ?? [])
				.map((f) => ({
					name: f,
					value: formData.get(f)?.toString()!,
				}))
				.reduce(
					(p, c) => {
						p[c.name as keyof T['text']] = c.value;
						return p;
					},
					{} as Record<keyof T['text'], string>,
				);

			const switches = (data.checkbox ?? [])
				.map((f) => ({
					name: f,
					value: formData.get(f)?.toString() === 'on',
				}))
				.reduce(
					(p, c) => {
						p[c.name as keyof T['checkbox']] = c.value;
						return p;
					},
					{} as Record<keyof T['checkbox'], boolean>,
				);

			const allText = (data.multiText ?? [])
				.map((f) => ({
					name: f,
					value: formData.getAll(f).map((f) => f.toString()),
				}))
				.reduce(
					(p, c) => {
						p[c.name as keyof T['multiText']] = c.value;
						return p;
					},
					{} as Record<keyof T['multiText'], string[]>,
				);

			const file = (
				await Promise.all(
					(data.file ?? [])
						.map((f) => ({
							name: f,
							value:
								formData.get(f) !== null
									? (formData.get(
											f,
										)! as unknown as FileList[number])
									: undefined,
						}))
						.map(async (f) => ({
							...f,
							value: await f.value?.text(),
						})),
				)
			).reduce(
				(p, c) => {
					if (!c.value) return p;
					p[c.name as keyof T['file']] = c.value;

					return p;
				},
				{} as Record<keyof T['file'], string>,
			);

			return {
				...textFields,
				...switches,
				...allText,
				...file,
			};
		}

		return async (
			event: SubmitEvent & {
				currentTarget: EventTarget & HTMLFormElement;
			},
		) => {
			event.preventDefault();

			const formData = new FormData(event.currentTarget);

			const data = await getData(fields, formData);

			updatedPopupData = { ...updatedPopupData, ...data };

			const reqFormData = new FormData();

			for (const key in data) {
				reqFormData.append(
					key,
					data[key as keyof typeof data].toString(),
				);
			}

			reqFormData.append('data', JSON.stringify(updatedPopupData));
			reqFormData.append('id', popupID!.toString());

			if (popupID === 'new') {
				switch (configStep) {
					case 'config':
						configStep = 'failover';
						break;
					case 'failover':
						configStep = 'tls';
						break;
					case 'tls':
						await save();
						break;
				}
			} else await save();

			async function save() {
				const res = await axios.post(
					event.currentTarget.action,
					reqFormData,
					{
						headers: {
							'x-sveltekit-action': 'true',
						},
					},
				);

				const result = deserialize(JSON.stringify(res.data));

				if (result.type === 'success') {
					await invalidateAll();
				}

				applyAction(result);
			}
		};
	}
</script>

<svelte:head>
	<title>Reverse Proxy Settings | Cadgate</title>
</svelte:head>

{#snippet confirmButton()}
	<button class="btn btn-outline btn-success" disabled={loading}>
		{#if popupID === 'new'}
			Next Step
		{:else}
			Update Proxy!
		{/if}
	</button>
{/snippet}

{#snippet viewConfiguration(input: Partial<proxyEntry>)}
	<form
		action="?/update"
		method="post"
		onsubmit={handleUpdate({
			checkbox: ['cloudflare', 'enforceHttps'],
			multiText: ['hosts'],
			text: ['name', 'to'],
			currentView: 'config',
		})}
		class="flex flex-col gap-6"
	>
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

		{@render confirmButton()}
	</form>
{/snippet}
{#snippet viewFailover(input: Partial<proxyEntry>)}
	<form
		method="post"
		onsubmit={handleUpdate({ currentView: 'failover' })}
		class="flex flex-col gap-6"
	>
		<p>Coming soon!</p>

		{@render confirmButton()}
	</form>
{/snippet}
{#snippet viewTLS(input: Partial<proxyEntry>)}
	<form
		onsubmit={handleUpdate({
			currentView: 'tls',
			text: ['tlsMode'],
			file: ['tlsCert', 'tlsKey'],
		})}
		class="flex flex-col gap-6"
	>
		<p>Mode</p>
		<select name="tlsMode" class="w-full" bind:value={tlsMode}>
			<option value="auto">Auto</option>
			<option value="file" disabled>File</option>
		</select>

		{#if tlsMode === 'file'}
			<p>Cert</p>
			<input type="file" name="cert" />
			<p>Key</p>
			<input type="file" name="key" />
		{/if}

		{@render confirmButton()}
	</form>
{/snippet}

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
			class="bg-slate-900 lg:rounded-xl p-8 w-full h-full lg:w-3/4 lg:h-max m-auto border-slate-600 lg:border drop-shadow-2xl overflow-hidden"
		>
			<HeightTransition duration={300}>
				<div class="flex flex-col gap-6">
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

					{@render message(popupID === 'new')}

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

					{#key configStep}
						<div
							in:fade={{ duration: 150, delay: 200 }}
							out:fade={{ duration: 150 }}
						>
							{#if configStep === 'config'}
								{@render viewConfiguration(input)}
							{:else if configStep === 'failover'}
								{@render viewFailover(input)}
							{:else if configStep === 'tls'}
								{@render viewTLS(input)}
							{/if}
						</div>
					{/key}
				</div>
			</HeightTransition>
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

{#if popupID && updatedPopupData}
	{@render popup(updatedPopupData, configStep)}
{/if}

{#snippet message(failOnly: boolean = true)}
	{#if form?.message && (failOnly ? !form.success : true)}
		<div
			class="p-2 w-full rounded-xl"
			class:bg-green-500={form.success}
			class:bg-red-500={!form.success}
		>
			{form.message}
		</div>
	{/if}
{/snippet}

<div class="p-3 rounded-xl bg-slate-900 my-4">
	{#if popupID === null || popupID === 'new'}
		{@render message()}
	{/if}

	<div class="flex flex-row items-center justify-between mb-2">
		<h3 class="text-xl">Reverse Proxies</h3>
		<button
			class="btn btn-square"
			onclick={() => {
				updatedPopupData = undefined;
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
