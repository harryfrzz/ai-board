<script lang="ts">
    import { currentTool, type Tool } from "$lib/toolStore";
    import { Image, FileText, Headphones } from "lucide-svelte";

    let { popUpOpen }: { popUpOpen: boolean } = $props()
    function selectTool(tool: Tool) {
        currentTool.set(tool);
    }

</script>
{#if popUpOpen}
<div class="absolute left-16 top-1/2 -translate-y-1/2 w-14 h-auto gap-2 bg-white shadow-lg flex flex-col items-center justify-center py-2 px-1.5 rounded-lg">
    <button class="hover:bg-green-200 rounded-md transition-colors w-full p-2 flex justify-center items-center" class:bg-green-300={$currentTool === 'image'} onclick={() => selectTool('image')}><Image/></button>
    <button class="hover:bg-green-200 rounded-md transition-colors w-full p-2 flex justify-center items-center" class:bg-green-300={$currentTool === 'pdf'} onclick={() => selectTool('pdf')}><FileText/></button>
    <button class="hover:bg-green-200 rounded-md transition-colors w-full p-2 flex justify-center items-center" class:bg-green-300={$currentTool === 'audio'} onclick={() => selectTool('audio')}><Headphones/></button>
</div>
{/if}