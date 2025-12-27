<script lang="ts">
    import { Pen, Pencil, Paintbrush } from "@lucide/svelte";
    import { currentTool } from "$lib/toolStore";
    import { currentDrawingTool, currentDrawingColor, type DrawingTool } from "$lib/drawingStore";
    
    const drawingTools = [
        { id: 'pen', icon: Pen, label: 'Pen' },
        { id: 'pencil', icon: Pencil, label: 'Pencil' },
        { id: 'brush', icon: Paintbrush, label: 'Paint Brush' }
    ];
    
    const colors = [
        { id: 'black', value: '#000000' },
        { id: 'red', value: '#EF4444' },
        { id: 'blue', value: '#3B82F6' },
        { id: 'green', value: '#10B981' },
        { id: 'yellow', value: '#F59E0B' },
        { id: 'purple', value: '#8B5CF6' }
    ];
    
    function selectDrawingTool(tool: DrawingTool) {
        currentDrawingTool.set(tool);
    }
    
    function selectColor(color: string) {
        currentDrawingColor.set(color);
    }
</script>

{#if $currentTool === 'draw'}
<div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-6 border border-gray-200">
    <!-- Drawing Tools -->
    <div class="flex gap-2 items-center border-r border-gray-300 pr-4">
        {#each drawingTools as tool}
            <button
                class="p-2 rounded-md hover:bg-gray-100 transition-colors"
                class:bg-green-200={$currentDrawingTool === tool.id}
                class:text-green-600={$currentDrawingTool === tool.id}
                onclick={() => selectDrawingTool(tool.id as DrawingTool)}
                aria-label={tool.label}
            >
                <svelte:component this={tool.icon} size={20} />
            </button>
        {/each}
    </div>
    
    <!-- Color Palette -->
    <div class="flex gap-2 items-center">
        {#each colors as color}
            <button
                class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                class:border-gray-800={$currentDrawingColor === color.value}
                class:border-gray-300={$currentDrawingColor !== color.value}
                class:ring-2={$currentDrawingColor === color.value}
                class:ring-blue-400={$currentDrawingColor === color.value}
                style="background-color: {color.value}"
                onclick={() => selectColor(color.value)}
                aria-label={color.id}
            ></button>
        {/each}
    </div>
</div>
{/if}