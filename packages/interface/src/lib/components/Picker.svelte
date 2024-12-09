<script lang="ts">
    import IconX from '~icons/tabler/x';
    import Input from './Input.svelte';
    let currentElement = $state('');
    let {
        name,
        placeholder,
        label,
        value,
        onChange,
    }: {
        name: string;
        placeholder?: string;
        label?: string;
        value?: string[];
        onChange?: (c: string[]) => void;
    } = $props();

    let elements = $state<string[]>([]);

    $effect(() => {
        if (onChange) onChange(elements);
    });

    if (value) elements = value;
</script>

<div class="flex flex-col gap-2">
    {#each elements as element}
        <input type="text" value={element} {name} class="hidden" />
    {/each}

    {#if label}
        <p>{label}</p>
    {/if}

    <div class="flex flex-row gap-4">
        {#each elements as element, i}
            <button
                onclick={() => {
                    elements.splice(i, 1);
                }}
                class="btn btn-bg"
            >
                <p>{element}</p>
                <IconX class="text-lg" />
            </button>
        {/each}
    </div>

    <form
        onsubmit={(e) => {
            e.preventDefault();
            if (currentElement.length < 1) return;

            elements.push(currentElement);
            currentElement = '';
        }}
    >
        <input
            class="w-full"
            type="text"
            value={currentElement}
            oninput={(e) => {
                currentElement = e.currentTarget.value;
            }}
            {placeholder}
        />
    </form>
</div>
