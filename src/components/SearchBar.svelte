<script lang="ts">
    import { Search } from "lucide-svelte";
    let popUpOpen = $state(false)
    let searchInput: HTMLInputElement;
    
    function searchBarPopup(){
        popUpOpen = !popUpOpen
    }

    $effect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                searchBarPopup();
                setTimeout(() => searchInput?.focus(), 0);
            } else if (e.key === 'Escape' && popUpOpen) {
                e.preventDefault();
                popUpOpen = false;
            }
        }
        
        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

{#if popUpOpen}
<div class="w-150 h-15 absolute top-40 left-1/2 -translate-x-1/2 rounded-lg bg-white shadow-lg flex items-center">
    <input bind:this={searchInput} placeholder="Search for anything" class="w-full h-full px-4 outline-none"/>
    <Search class='mr-4'/>
</div>
{/if}