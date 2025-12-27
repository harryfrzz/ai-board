<script lang='ts'>
    import { 
        Hand, 
        MousePointerClickIcon, 
        Shapes, 
        Image, 
        PencilLine,
        CaseSensitive
    } from "@lucide/svelte";
    import { currentTool, type Tool } from "$lib/toolStore";
    import MediaPopup from "./MediaPopup.svelte";

    let popUpOpen = $state(false)
    function selectTool(tool: Tool) {
        currentTool.set(tool);
    }
    function togglePopup(){
        popUpOpen = !popUpOpen
    }
    
    $effect(() => {
        if ($currentTool != 'media') {
            popUpOpen = false;
        }
    });
    
    const tools: Array<{ id: Tool; icon: any; label: string }> = [
        { id: 'pan', icon: Hand, label: 'Grab' },
        { id: 'select', icon: MousePointerClickIcon, label: 'Select' },
        { id: 'draw', icon: PencilLine, label: 'Draw' },
        { id: 'text', icon: CaseSensitive, label: 'Text' },
        { id: 'shape', icon: Shapes, label: 'Shapes' },
    ];

</script>

<div class="absolute left-4 top-1/2 -translate-y-1/2 w-14 py-2 px-1.5 flex flex-col gap-4 backdrop-blur-sm 
h-90 rounded-lg bg-white shadow-lg items-center justify-center">
    {#each tools as tool}
        <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-200={$currentTool === tool.id}
        class:text-green-600={$currentTool === tool.id}
        onclick={() => selectTool(tool.id)}
        aria-label="Pan tool">
            <tool.icon size={23}/>
        </button>
    {/each}
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        onclick={togglePopup}
        class:bg-green-200={$currentTool === 'media'}
        class:text-green-600={$currentTool === 'media'}
        aria-label="Image tool"
    >
        <Image/>
    </button>
    <MediaPopup popUpOpen={popUpOpen}/>
</div>
