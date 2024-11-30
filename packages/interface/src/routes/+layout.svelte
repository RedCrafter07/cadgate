<script lang="ts">
	import '../app.css';
	import "@fontsource-variable/dm-sans"
	let { children } = $props();
</script>

<div class="w-full min-h-screen">
	{@render children()}
</div>
