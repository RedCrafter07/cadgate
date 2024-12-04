<script lang="ts">
	import IconCheck from "~icons/tabler/check";
	import IconX from "~icons/tabler/x";

	const { data } = $props();

	const { proxies } = $derived(data);
</script>

<table class="w-full table-auto">
	<thead>
		<tr>
			<td>Name</td>
			<td>To</td>
			<td>Hosts</td>
			<td>Enforce HTTPS</td>
			<td>Cloudflare integration</td>
		</tr>
	</thead>
	<tbody>
		{#each proxies as proxy}
			<tr>
				<td>{proxy.name ?? proxy.to}</td>
			
				<td>{proxy.to}</td>
			
				<td class="flex flex-row gap-2">
					{#each proxy.hosts as host}
						<div class="p-1 rounded-xl bg-slate-800">{host}</div>
					{/each}
				</td>

				<td>
					{#if proxy.enforceHttps}
						<IconCheck/>
					{:else}
						<IconX/>
					{/if}
				</td>
				<td>{proxy.cloudflare ? "Yes": "No"}</td>
			</tr>
		{/each}
	</tbody>
</table>
