<script lang="ts">
    type Event = MouseEvent & {
        currentTarget: EventTarget & HTMLButtonElement;
    };
    const props: {
        label?: string;
        name?: string;
        description?: string;
        checked?: boolean;
        disabled?: boolean;
        onChange?: (v: boolean, e?: Event) => void;
    } = $props();

    let checked = $state(false);

    $effect(() => {
        if (props.checked) checked = props.checked;
    });

    $effect(() => {
        if (props.onChange) props.onChange(checked);
    });

    function change(e: Event) {
        if (props.onChange) props.onChange(!checked, e);
        checked = !checked;
    }
</script>

<button
    class="flex flex-row items-center gap-4 w-max"
    onclick={(e) => {
        e.preventDefault();
        change(e);
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

    <div class="flex flex-col items-start my-auto gap-1">
        {#if props.label}
            <p class="text-slate-100">
                {props.label}
            </p>
        {/if}
        {#if props.description}
            <p class="text-slate-100 text-sm opacity-75 text-left">
                {props.description}
            </p>
        {/if}
    </div>
</button>
