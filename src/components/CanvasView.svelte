<script lang="ts">
  import { currentTool } from '$lib/toolStore';
  import { canvasObjects, addObject, selectObject, deselectAll } from '$lib/canvasStore';
  import ImageComponent from './ImageComponent.svelte';
  import PdfComponent from './PdfComponent.svelte';
  import AudioComponent from './AudioComponent.svelte';
  import LinkComponent from './LinkComponent.svelte';

  let container: HTMLDivElement;
  
  // Camera state
  let pan = { x: 0, y: 0 };
  let zoom = 1;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };

  // Grid settings
  const gridSize = 80;

  function handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    
    // Check if clicking on an existing object
    if (target.closest('.canvas-object')) {
      return; // Let the object handle its own interactions
    }

    if ($currentTool === 'pan') {
      isDragging = true;
      lastMouse = { x: e.clientX, y: e.clientY };
    } else if ($currentTool === 'image') {
      // Add image at click position
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      addObject({
        type: 'image',
        x: worldX,
        y: worldY,
        width: 300,
        height: 200,
        data: { src: 'https://via.placeholder.com/300x200' }
      });
    } else if ($currentTool === 'pdf') {
      // Add PDF at click position
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      addObject({
        type: 'pdf',
        x: worldX,
        y: worldY,
        width: 400,
        height: 500,
        data: { url: 'sample.pdf' }
      });
    } else if ($currentTool === 'audio') {
      // Add audio at click position
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      addObject({
        type: 'audio',
        x: worldX,
        y: worldY,
        width: 350,
        height: 150,
        data: { url: 'sample.mp3' }
      });
    } else if ($currentTool === 'link') {
      // Add link at click position
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      addObject({
        type: 'link',
        x: worldX,
        y: worldY,
        width: 400,
        height: 280,
        data: { url: '' }
      });
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || $currentTool !== 'pan') return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    pan.x += deltaX;
    pan.y += deltaY;

    lastMouse = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to world coordinates before zoom
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));

    pan.x = mouseX - worldX * newZoom;
    pan.y = mouseY - worldY * newZoom;

    zoom = newZoom;
  }

  $: cursorClass = $currentTool === 'pan' 
    ? (isDragging ? 'cursor-grabbing' : 'cursor-grab')
    : ($currentTool === 'image' || $currentTool === 'pdf' || $currentTool === 'audio' ? 'cursor-crosshair' : 'cursor-default');
</script>

<div
  bind:this={container}
  class="w-full h-screen overflow-hidden relative {cursorClass}"
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
  onwheel={handleWheel}
  style="background-color: #F7F7F7;"
>
  <!-- Grid Layer -->
  <svg 
    class="absolute inset-0 pointer-events-none w-full h-full"
    style="transform: translate({pan.x}px, {pan.y}px) scale({zoom}); transform-origin: 0 0;"
  >
    <defs>
      <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
        <rect width={gridSize} height={gridSize} fill="none" stroke="#EBEBEB" stroke-width={1 / zoom} />
      </pattern>
    </defs>
    <rect 
      x={Math.floor((-pan.x / zoom) / gridSize) * gridSize - gridSize * 2}
      y={Math.floor((-pan.y / zoom) / gridSize) * gridSize - gridSize * 2}
      width={(container?.offsetWidth || 2000) / zoom + gridSize * 4}
      height={(container?.offsetHeight || 2000) / zoom + gridSize * 4}
      fill="url(#grid)"
    />
  </svg>

  <!-- Objects Layer -->
  <div 
    class="absolute inset-0"
    style="transform: translate({pan.x}px, {pan.y}px) scale({zoom}); transform-origin: 0 0;"
  >
    {#each $canvasObjects as obj (obj.id)}
      <div
        class="canvas-object absolute"
        style="left: {obj.x}px; top: {obj.y}px; width: {obj.width}px; height: {obj.height}px;"
      >
        {#if obj.type === 'image'}
          <ImageComponent {obj} />
        {:else if obj.type === 'pdf'}
          <PdfComponent {obj} />
        {:else if obj.type === 'audio'}
          <AudioComponent {obj} />
        {:else if obj.type === 'link'}
          <LinkComponent {obj} />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .cursor-grabbing {
    cursor: grabbing !important;
  }

  .cursor-crosshair {
    cursor: crosshair !important;
  }
</style>