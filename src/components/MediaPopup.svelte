<script lang="ts">
    import { currentTool, type Tool } from "$lib/toolStore";
    import { Image, FileText, Headphones, Link, icons } from "lucide-svelte";

    let { popUpOpen }: { popUpOpen: boolean } = $props()
    function selectTool(tool: Tool) {
        currentTool.set(tool);
    }
    const mediaTools: Array<{id: Tool, icon: any, label: String}> = [
        { id: 'image', icon: Image, label: 'Image' },
        { id: 'pdf', icon: FileText, label: 'pdf' },
        { id: 'audio', icon: Headphones, label: 'Audio' },
        { id: 'link', icon: Link, label: 'link' },
    ];

</script>
{#if popUpOpen}
    <div class="absolute left-16 top-1/2 -translate-y-1/2 w-14 h-auto gap-2 bg-white shadow-lg flex flex-col items-center justify-center py-2 px-1.5 rounded-lg">
        {#each mediaTools as tool}
            <button class="hover:bg-green-200 rounded-md w-full p-2 flex justify-center items-center transition-colors" class:bg-green-200={$currentTool === tool.id} class:text-green-600={$currentTool === tool.id} onclick={() => selectTool(tool.id)}><tool.icon size={23}/></button>
        {/each}
    </div>
{/if}