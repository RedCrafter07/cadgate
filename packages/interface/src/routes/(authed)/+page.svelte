<script lang="ts">
	import IconDirections from '~icons/tabler/directions';
	import IconExternalLink from '~icons/tabler/external-link';

	const { data } = $props();
</script>

<svelte:head>
	<title>Dashboard | Cadgate</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<h1 class="text-3xl">Welcome to Cadgate, {data.user.name}!</h1>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<a
			href="/proxy"
			class="bg-slate-900 w-full rounded-xl p-4 flex flex-row gap-4 items-center justify-left hover:drop-shadow-xl transition-all duration-200"
		>
			<div class="p-4 rounded-xl bg-slate-800">
				<IconDirections />
			</div>
			<p>{0} Proxy Hosts</p>
		</a>
		<a
			href="/redirect"
			class="bg-slate-900 w-full rounded-xl p-4 flex flex-row gap-4 items-center justify-left hover:drop-shadow-xl transition-all duration-200"
		>
			<div class="p-4 rounded-xl bg-slate-800">
				<IconExternalLink />
			</div>
			<p>{0} Redirect Hosts</p>
		</a>
	</div>
</div>
