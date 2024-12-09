<script lang="ts">
    const {
        name,
        placeholder,
        label,
        value,
        onInput,
    }: {
        name?: string;
        label?: string;
        placeholder?: string;
        value?: string;
        onInput?: (t: string) => void;
    } = $props();
</script>

<div class="flex flex-col gap-2">
    {#if label}<p>{label}</p>{/if}
    <input
        type="text"
        class="w-full"
        {name}
        {placeholder}
        {value}
        oninput={(e) => {
            if (onInput) onInput(e.currentTarget.value);
        }}
    />
</div>
