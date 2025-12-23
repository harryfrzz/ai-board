<script lang="ts">
  import { updateObject, removeObject } from '$lib/canvasStore';
  import { Trash2, Move } from 'lucide-svelte';
  import type { CanvasObject } from '$lib/canvasStore';

  export let obj: CanvasObject;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let isResizing = false;
  let resizeStart = { x: 0, y: 0, width: 0, height: 0 };

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

  function handleImageError(e: Event) {
    // If image fails to load, show placeholder
    console.error('Failed to load image:', obj.data.src);
  }

  function openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateObject(obj.id, {
            data: { ...obj.data, src: e.target?.result as string }
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

<div class="relative w-full h-full group bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
  <!-- Image -->
  <img 
    src={obj.data.src} 
    alt="Add Image"
    class="w-full h-full object-cover"
    on:error={handleImageError}
    draggable="false"
  />

  <!-- Hover Controls -->
  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
    <button
      class="p-1.5 bg-white rounded shadow-md hover:bg-gray-100 z-10"
      on:mousedown={handleDragStart}
      title="Move"
    >
      <Move size={16} />
    </button>
    <button
      class="p-1.5 bg-white rounded shadow-md hover:bg-red-100 text-red-600 z-10"
      on:click={handleDelete}
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  </div>

  <!-- Click to upload if placeholder -->
  {#if obj.data.src.includes('placeholder')}
    <button
      class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium"
      on:click={openFileDialog}
    >
      Click to upload image
    </button>
  {/if}

  <!-- Selection indicator -->
  {#if obj.selected}
    <div class="absolute inset-0 border-4 border-blue-500 pointer-events-none rounded-lg"></div>
  {/if}
</div>

<style>
  .group:hover {
    z-index: 10;
  }
</style>
