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

</script>

<div class="absolute left-4 top-1/2 -translate-y-1/2 w-14 py-2 px-1.5 flex flex-col gap-4 backdrop-blur-sm 
h-90 rounded-lg bg-white shadow-lg items-center justify-center">

    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-300={$currentTool === 'pan'}
        onclick={() => selectTool('pan')}
        aria-label="Pan tool"
    >
        <Hand/>
    </button>
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-300={$currentTool === 'select'}
        onclick={() => selectTool('select')}
        aria-label="Select tool"
    >
        <MousePointerClickIcon/>
    </button>
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-300={$currentTool === 'draw'}
        onclick={() => selectTool('draw')}
        aria-label="Draw tool"
    >
        <PencilLine/>
    </button>
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-300={$currentTool === 'text'}
        onclick={() => selectTool('text')}
        aria-label="Text tool"
    >
        <CaseSensitive/>
    </button>
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        class:bg-green-300={$currentTool === 'shape'}
        onclick={() => selectTool('shape')}
        aria-label="Shape tool"
    >
        <Shapes/>
    </button>
    <button 
        class="flex p-2 justify-center items-center hover:bg-green-200 rounded-md transition-colors"
        onclick={togglePopup}
        aria-label="Image tool"
    >
        <Image/>
    </button>
    <MediaPopup popUpOpen={popUpOpen}/>
</div>
