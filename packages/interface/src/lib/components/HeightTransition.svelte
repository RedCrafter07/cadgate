<script lang="ts">
	import type { Snippet } from 'svelte';
	import { circOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	type TweenedOptions<T> = Parameters<typeof tweened<T>>[1];

	const { duration, children }: { duration: number; children: Snippet } =
		$props();

	let height = $state(0);
	let currentHeight = $state(0);

	const animationConfig: TweenedOptions<number> = {
		duration: duration,
		easing: circOut,
	};

	let animate = tweened(0, animationConfig);

	$effect(() => {
		if (currentHeight < height)
			animate.set(height, { ...animationConfig, delay: duration });
		else animate.set(height, animationConfig);

		currentHeight = height;
	});
</script>

<div style="height:{$animate}px;">
	<div bind:offsetHeight={height}>
		{@render children()}
	</div>
</div>
