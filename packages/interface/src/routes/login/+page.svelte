<script lang="ts">
	import { enhance } from '$app/forms';

	import IconKey from '~icons/tabler/key';
</script>

<div class="w-full h-screen flex items-center justify-center bg-slate-950">
	<div class="h-3/4 w-3/4 bg-slate-900 rounded-xl flex flex-row gap-12 p-8">
		<div class="flex-1 flex flex-col text-center items-center justify-center">
			<h1 class="text-5xl">Welcome!</h1>
			<h3 class="text-2xl">Please log in to use Cadgate.</h3>
		</div>
		<div class="h-full bg-slate-50 w-px opacity-10"></div>
		<div class="flex-1 flex">
			<form class="flex flex-col gap-4 w-full my-auto" method="post" use:enhance>
				<IconKey class="text-[6rem] text-slate-400 mx-auto pb-4" />
				<input tabindex="0" type="text" name="email" placeholder="Email">
				<input type="password" name="password" placeholder="Password">
				<button class="w-full bg-violet-500 text-slate-800 rounded-xl p-4 focus:scale-105 focus:outline-none transition-all duration-100">Log in!</button>
			</form>
		</div>
	</div>
</div>