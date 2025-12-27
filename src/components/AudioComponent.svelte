<script lang="ts">
  import { updateObject, removeObject } from '$lib/canvasStore';
  import { Trash2, Move, Music } from 'lucide-svelte';
  import type { CanvasObject } from '$lib/canvasStore';

  export let obj: CanvasObject;

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let isResizing = false;
  let resizeStart = { x: 0, y: 0, width: 0, height: 0, objX: 0, objY: 0 };
  let resizeCorner: 'se' | 'sw' | 'ne' | 'nw' | null = null;
  let audioElement: HTMLAudioElement;

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
    input.accept = 'audio/*';
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
      newWidth = Math.max(250, resizeStart.width + deltaX);
      newHeight = Math.max(120, resizeStart.height + deltaY);
    } else if (resizeCorner === 'sw') {
      newWidth = Math.max(250, resizeStart.width - deltaX);
      newHeight = Math.max(120, resizeStart.height + deltaY);
      if (newWidth !== resizeStart.width) {
        newX = resizeStart.objX + (resizeStart.width - newWidth);
      }
    } else if (resizeCorner === 'ne') {
      newWidth = Math.max(250, resizeStart.width + deltaX);
      newHeight = Math.max(120, resizeStart.height - deltaY);
      if (newHeight !== resizeStart.height) {
        newY = resizeStart.objY + (resizeStart.height - newHeight);
      }
    } else if (resizeCorner === 'nw') {
      newWidth = Math.max(250, resizeStart.width - deltaX);
      newHeight = Math.max(120, resizeStart.height - deltaY);
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

<div class="relative w-full h-full group bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-colors">
  {#if obj.data.url && !obj.data.url.includes('sample.mp3')}
    <!-- Audio Player -->
    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Music size={48} class="text-orange-500 mb-4" />
      {#if obj.data.fileName}
        <p class="text-sm font-medium text-gray-700 mb-4 text-center px-2 truncate max-w-full">
          {obj.data.fileName}
        </p>
      {/if}
      <audio 
        bind:this={audioElement}
        src={obj.data.url} 
        controls 
        class="w-full max-w-md"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  {:else}
    <!-- Placeholder -->
    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <Music size={64} class="text-orange-400 mb-4" />
      <p class="text-gray-600 font-medium mb-2">Audio Player</p>
      <button
        class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        on:click={openFileDialog}
      >
        Upload Audio
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
    <div class="absolute inset-0 border-4 border-orange-500 pointer-events-none rounded-lg"></div>
  {/if}

  <!-- Resize handles -->
  <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-orange-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'se')}></div>
  <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'sw')}></div>
  <div class="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'ne')}></div>
  <div class="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'nw')}></div>
</div>

<style>
  .group:hover {
    z-index: 10;
  }
</style>
