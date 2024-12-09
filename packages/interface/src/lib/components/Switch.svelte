<script lang="ts">
    const props: {
        label?: string;
        name?: string;
        checked?: boolean;
        disabled?: boolean;
        onChange?: (v: boolean) => void;
    } = $props();

    let checked = $state(false);

    $effect(() => {
        if (props.checked) checked = props.checked;
    });

    $effect(() => {
        if (props.onChange) props.onChange(checked);
    });

    function change() {
        if (props.onChange) props.onChange(!checked);
        checked = !checked;
    }
</script>

<button
    class="flex flex-row gap-2 w-max"
    onclick={(e) => {
        e.preventDefault();
        change();
    }}
>
    <input type="checkbox" class="hidden" {checked} name={props.name} />
    <div
        class="relative p-1 rounded-full w-10 h-6 transition-colors duration-150"
        class:bg-slate-600={!checked}
        class:bg-lime-600={checked}
    >
        <div class="h-full w-full"></div>
        <div
            class="absolute top-1 left-1 rounded-full w-4 h-4 bg-slate-100 transition-all duration-150"
            class:translate-x-4={checked}
        ></div>
    </div>

    {#if props.label}
        <p class="text-slate-100">
            {props.label}
        </p>
    {/if}
</button>
