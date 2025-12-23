<script lang="ts">
  import { updateObject, removeObject } from '$lib/canvasStore';
  import { Trash2, Move, FileText } from 'lucide-svelte';
  import type { CanvasObject } from '$lib/canvasStore';

  export let obj: CanvasObject;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function handleDragStart(e: MouseEvent) {
    e.stopPropagation();
    isDragging = true;
    dragOffset = {
      x: e.clientX - obj.x,
      y: e.clientY - obj.y
    };
  }

  function handleDrag(e: MouseEvent) {
    if (!isDragging) return;
    updateObject(obj.id, {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    removeObject(obj.id);
  }

  function openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateObject(obj.id, {
            data: { 
              ...obj.data, 
              url: e.target?.result as string,
              fileName: file.name 
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
</script>

<svelte:window
  on:mousemove={handleDrag}
  on:mouseup={handleDragEnd}
/>

<div class="relative w-full h-full group bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
  <!-- PDF Viewer - Using iframe for simple viewing -->
  {#if obj.data.url && !obj.data.url.includes('sample.pdf')}
    <iframe
      src={obj.data.url}
      class="w-full h-full border-0"
      title="PDF Viewer"
    ></iframe>
  {:else}
    <!-- Placeholder -->
    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <FileText size={64} class="text-purple-400 mb-4" />
      <p class="text-gray-600 font-medium mb-2">PDF Document</p>
      <button
        class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        on:click={openFileDialog}
      >
        Upload PDF
      </button>
    </div>
  {/if}

  <!-- Hover Controls -->
  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
    <button
      class="p-1.5 bg-white rounded shadow-md hover:bg-gray-100"
      on:mousedown={handleDragStart}
      title="Move"
    >
      <Move size={16} />
    </button>
    <button
      class="p-1.5 bg-white rounded shadow-md hover:bg-red-100 text-red-600"
      on:click={handleDelete}
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  </div>

  <!-- Selection indicator -->
  {#if obj.selected}
    <div class="absolute inset-0 border-4 border-purple-500 pointer-events-none rounded-lg"></div>
  {/if}

  <!-- File name label -->
  {#if obj.data.fileName}
    <div class="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded shadow text-xs font-medium text-gray-700">
      {obj.data.fileName}
    </div>
  {/if}
</div>

<style>
  .group:hover {
    z-index: 10;
  }
</style>
