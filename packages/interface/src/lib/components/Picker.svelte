<script lang="ts">
    import IconX from '~icons/tabler/x';
    import { fly } from 'svelte/transition';
    import { circIn, circOut } from 'svelte/easing';
    import { flip } from 'svelte/animate';
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

    <div
        class="flex flex-row gap-2 transition-all duration-150"
        class:h-10={elements.length > 0}
        class:delay-200={elements.length === 0}
        class:h-0={elements.length === 0}
    >
        {#each elements as element, i (element)}
            <div
                in:fly={{
                    y: 50,
                    delay: elements.length === 1 ? 150 : 0,
                    duration: 150,
                    easing: circOut,
                }}
                out:fly={{ y: -50, duration: 150, easing: circIn }}
                animate:flip={{ delay: 100, duration: 150 }}
            >
                <button
                    onclick={() => {
                        elements = elements.filter((_, index) => index !== i);
                    }}
                    class="btn btn-bg overflow-hidden group"
                >
                    <p>{element}</p>
                    <IconX
                        class="text-lg opacity-50 group-hover:opacity-90 transition-opacity"
                    />
                </button>
            </div>
        {/each}
    </div>

    <form
        onsubmit={(e) => {
            e.preventDefault();
            if (currentElement.length < 1) return;

            if (!elements.includes(currentElement))
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
