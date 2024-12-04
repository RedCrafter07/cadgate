<script lang="ts">
	import { goto } from "$app/navigation";
	import IconUser from "~icons/tabler/user-circle";
	import IconSettings from "~icons/tabler/settings";
	import IconDirections from "~icons/tabler/directions";
	import IconRoute from "~icons/tabler/route";
	import IconHome from "~icons/tabler/home";
	import IconCat from '~icons/tabler/cat';
	
	const { children, data } = $props();

	const user = $derived(data.user);
</script>	


<div class="flex flex-col bg-slate-800 min-h-screen">
	<div class="h-16 bg-slate-900 border-b border-slate-700 flex flex-row items-center p-4 gap-4">
		<a href="/" class="mr-8 flex flex-row gap-2"><IconCat class="text-lg opacity-90" /> Cadgate</a>
		<a href="/" class="btn"><IconHome class="text-lg opacity-90" /> Home</a>
		<a href="/proxy" class="btn"><IconRoute class="text-lg opacity-90" /> Proxy</a>
		<a href="/redirect" class="btn"><IconDirections class="text-lg opacity-90" /> Redirect</a>
		<a href="/system" class="btn"><IconSettings class="text-lg opacity-90" /> System</a>

		<button class="btn" disabled>Users <span class="px-2 py-1 rounded-full bg-yellow-300 text-yellow-950 text-sm">Soon!</span></button>
		<div class="ml-auto">
			<button class="btn" title="Sign out" onclick={() => {
				goto("/logout")
			}}>
				<IconUser class="text-xl" />
				<p>Logged in as {user!.name}</p>
			</button>
		</div>
	</div>
	<div class="container mx-auto p-2">
		{@render children()}
	</div>
</div>

