<script lang="ts">
  import { updateObject, removeObject } from '$lib/canvasStore';
  import { Trash2, Move } from 'lucide-svelte';
  import type { CanvasObject } from '$lib/canvasStore';

  export let obj: CanvasObject;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let isResizing = false;
  let resizeStart = { x: 0, y: 0, width: 0, height: 0, objX: 0, objY: 0 };
  let resizeCorner: 'se' | 'sw' | 'ne' | 'nw' | null = null;

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

  function handleResizeStart(e: MouseEvent, corner: 'se' | 'sw' | 'ne' | 'nw') {
    e.stopPropagation();
    isResizing = true;
    resizeCorner = corner;
    resizeStart = {
      x: e.clientX,
      y: e.clientY,
      width: obj.width,
      height: obj.height,
      objX: obj.x,
      objY: obj.y
    };
  }

  function handleResize(e: MouseEvent) {
    if (!isResizing || !resizeCorner) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = obj.x;
    let newY = obj.y;

    if (resizeCorner === 'se') {
      newWidth = Math.max(100, resizeStart.width + deltaX);
      newHeight = Math.max(100, resizeStart.height + deltaY);
    } else if (resizeCorner === 'sw') {
      newWidth = Math.max(100, resizeStart.width - deltaX);
      newHeight = Math.max(100, resizeStart.height + deltaY);
      if (newWidth !== resizeStart.width) {
        newX = resizeStart.objX + (resizeStart.width - newWidth);
      }
    } else if (resizeCorner === 'ne') {
      newWidth = Math.max(100, resizeStart.width + deltaX);
      newHeight = Math.max(100, resizeStart.height - deltaY);
      if (newHeight !== resizeStart.height) {
        newY = resizeStart.objY + (resizeStart.height - newHeight);
      }
    } else if (resizeCorner === 'nw') {
      newWidth = Math.max(100, resizeStart.width - deltaX);
      newHeight = Math.max(100, resizeStart.height - deltaY);
      if (newWidth !== resizeStart.width) {
        newX = resizeStart.objX + (resizeStart.width - newWidth);
      }
      if (newHeight !== resizeStart.height) {
        newY = resizeStart.objY + (resizeStart.height - newHeight);
      }
    }

    updateObject(obj.id, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY
    });
  }

  function handleResizeEnd() {
    isResizing = false;
    resizeCorner = null;
  }
</script>

<svelte:window
  on:mousemove={(e) => {
    handleDrag(e);
    handleResize(e);
  }}
  on:mouseup={() => {
    handleDragEnd();
    handleResizeEnd();
  }}
/>

<div class="relative w-full h-full group bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
  <!-- Image -->
  <img 
    src={obj.data.src} 
    alt="Add Image"
    class="w-full h-full object-cover text-transparent"
    on:error={handleImageError}
    draggable="false"
  />

  <!-- Hover Controls -->
  <div class="absolute top-2 right-2 flex gap-2">
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
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-white/90 hover:bg-white rounded-lg shadow-lg text-gray-700 font-medium"
      on:click={openFileDialog}
    >
      Add Image
    </button>
  {/if}

  <!-- Selection indicator -->
  {#if obj.selected}
    <div class="absolute inset-0 border-4 border-blue-500 pointer-events-none rounded-lg"></div>
  {/if}

  <!-- Resize handles -->
  <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'se')}></div>
  <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'sw')}></div>
  <div class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'ne')}></div>
  <div class="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'nw')}></div>
</div>

<style>
  .group:hover {
    z-index: 10;
  }
</style>
