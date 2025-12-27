<script lang="ts">
  import { updateObject, removeObject } from '$lib/canvasStore';
  import { Trash2, Move, FileText } from 'lucide-svelte';
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
      newWidth = Math.max(200, resizeStart.width + deltaX);
      newHeight = Math.max(200, resizeStart.height + deltaY);
    } else if (resizeCorner === 'sw') {
      newWidth = Math.max(200, resizeStart.width - deltaX);
      newHeight = Math.max(200, resizeStart.height + deltaY);
      if (newWidth !== resizeStart.width) {
        newX = resizeStart.objX + (resizeStart.width - newWidth);
      }
    } else if (resizeCorner === 'ne') {
      newWidth = Math.max(200, resizeStart.width + deltaX);
      newHeight = Math.max(200, resizeStart.height - deltaY);
      if (newHeight !== resizeStart.height) {
        newY = resizeStart.objY + (resizeStart.height - newHeight);
      }
    } else if (resizeCorner === 'nw') {
      newWidth = Math.max(200, resizeStart.width - deltaX);
      newHeight = Math.max(200, resizeStart.height - deltaY);
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

  {#if obj.selected}
    <div class="absolute inset-0 border-4 border-purple-500 pointer-events-none rounded-lg"></div>
  {/if}

  {#if obj.data.fileName}
    <div class="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded shadow text-xs font-medium text-gray-700">
      {obj.data.fileName}
    </div>
  {/if}

  <!-- Resize handles -->
  <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'se')}></div>
  <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'sw')}></div>
  <div class="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'ne')}></div>
  <div class="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
       on:mousedown={(e) => handleResizeStart(e, 'nw')}></div>
</div>

<style>
  .group:hover {
    z-index: 10;
  }
</style>
