<script lang="ts">

  // TODO
  // Have to fix Pan tool issue of getting buttons clicked
  import { currentTool } from '$lib/toolStore';
  import { canvasObjects, addObject, selectObject, deselectAll } from '$lib/canvasStore';
  import { currentDrawingTool, currentDrawingColor, isDrawing, currentStroke, toolWidths, type DrawingStroke } from '$lib/drawingStore';
  import ImageComponent from './ImageComponent.svelte';
  import PdfComponent from './PdfComponent.svelte';
  import AudioComponent from './AudioComponent.svelte';
  import LinkComponent from './LinkComponent.svelte';
  import DrawingComponent from './DrawingComponent.svelte';

  let container: HTMLDivElement;
  
  // Camera state
  let pan = { x: 0, y: 0 };
  let zoom = 1;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };

  // Grid settings
  const gridSize = 80;

  // Drawing state
  let activeDrawingId: string | null = null;
  let tempStrokes: DrawingStroke[] = [];

  // UUID generator fallback
  function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    
    if (target.closest('.canvas-object') && $currentTool !== 'draw' && $currentTool !== 'pan') {
      return; // Let the object handle its own interactions
    }

    if ($currentTool === 'draw') {
      // Start drawing
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      isDrawing.set(true);
      currentStroke.set([{ x: worldX, y: worldY }]);
      
      // Find or create drawing object
      const existingDrawing = $canvasObjects.find(obj => obj.type === 'drawing');
      if (existingDrawing) {
        activeDrawingId = existingDrawing.id;
      } else {
        activeDrawingId = addObject({
          type: 'drawing',
          x: 0,
          y: 0,
          width: 10000,
          height: 10000,
          data: { strokes: [] }
        });
      }
    } else if ($currentTool === 'pan') {
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
    if ($currentTool === 'draw' && $isDrawing) {
      // Continue drawing
      const rect = container.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      
      currentStroke.update(points => [...points, { x: worldX, y: worldY }]);
    } else if (isDragging && $currentTool === 'pan') {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;

      pan.x += deltaX;
      pan.y += deltaY;

      lastMouse = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseUp() {
    if ($currentTool === 'draw' && $isDrawing) {
      if (activeDrawingId && $currentStroke.length > 0) {
        // Finish drawing stroke
        const stroke: DrawingStroke = {
          id: generateUUID(),
          points: [...$currentStroke],
          color: $currentDrawingColor,
          tool: $currentDrawingTool,
          width: toolWidths[$currentDrawingTool]
        };
        
        console.log('Saving stroke (mouse):', stroke);
        
        // Update the drawing object with the new stroke
        canvasObjects.update(objects => {
          const updated = objects.map(obj => {
            if (obj.id === activeDrawingId) {
              const currentStrokes = obj.data.strokes || [];
              const newStrokes = [...currentStrokes, stroke];
              console.log('Updated strokes count:', newStrokes.length);
              return {
                ...obj,
                data: { strokes: newStrokes }
              };
            }
            return obj;
          });
          console.log('Canvas objects after update:', updated);
          return updated;
        });
      }
      
      // Always reset drawing state on mouse up
      isDrawing.set(false);
      currentStroke.set([]);
    }
    
    if (isDragging) {
      isDragging = false;
    }
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

  // Touch event handlers for mobile support
  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    
    if (target.closest('.canvas-object') && $currentTool !== 'draw' && $currentTool !== 'pan') {
      return;
    }

    if ($currentTool === 'draw') {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const worldX = (touch.clientX - rect.left - pan.x) / zoom;
      const worldY = (touch.clientY - rect.top - pan.y) / zoom;
      
      isDrawing.set(true);
      currentStroke.set([{ x: worldX, y: worldY }]);
      
      const existingDrawing = $canvasObjects.find(obj => obj.type === 'drawing');
      if (existingDrawing) {
        activeDrawingId = existingDrawing.id;
      } else {
        activeDrawingId = addObject({
          type: 'drawing',
          x: 0,
          y: 0,
          width: 10000,
          height: 10000,
          data: { strokes: [] }
        });
      }
    } else if ($currentTool === 'pan') {
      e.preventDefault();
      isDragging = true;
      lastMouse = { x: touch.clientX, y: touch.clientY };
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];

    if ($currentTool === 'draw' && $isDrawing) {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const worldX = (touch.clientX - rect.left - pan.x) / zoom;
      const worldY = (touch.clientY - rect.top - pan.y) / zoom;
      
      currentStroke.update(points => [...points, { x: worldX, y: worldY }]);
    } else if (isDragging && $currentTool === 'pan') {
      e.preventDefault();
      const deltaX = touch.clientX - lastMouse.x;
      const deltaY = touch.clientY - lastMouse.y;

      pan.x += deltaX;
      pan.y += deltaY;

      lastMouse = { x: touch.clientX, y: touch.clientY };
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if ($currentTool === 'draw' && $isDrawing) {
      e.preventDefault();
      if (activeDrawingId && $currentStroke.length > 0) {
        const stroke: DrawingStroke = {
          id: generateUUID(),
          points: [...$currentStroke],
          color: $currentDrawingColor,
          tool: $currentDrawingTool,
          width: toolWidths[$currentDrawingTool]
        };
        
        console.log('Saving stroke:', stroke);
        
        canvasObjects.update(objects => {
          const updated = objects.map(obj => {
            if (obj.id === activeDrawingId) {
              const currentStrokes = obj.data.strokes || [];
              const newStrokes = [...currentStrokes, stroke];
              console.log('Updated strokes count:', newStrokes.length);
              return {
                ...obj,
                data: { strokes: newStrokes }
              };
            }
            return obj;
          });
          console.log('Canvas objects after update:', updated);
          return updated;
        });
      }
      
      isDrawing.set(false);
      currentStroke.set([]);
    }
    
    if (isDragging) {
      isDragging = false;
    }
  }

  $: cursorClass = $currentTool === 'pan' 
    ? (isDragging ? 'cursor-grabbing' : 'cursor-grab')
    : ($currentTool === 'draw' ? 'cursor-crosshair' 
    : ($currentTool === 'image' || $currentTool === 'pdf' || $currentTool === 'audio' ? 'cursor-crosshair' : 'cursor-default'));
</script>

<div
  bind:this={container}
  class="w-full h-screen overflow-hidden relative {cursorClass}"
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
  onwheel={handleWheel}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  ontouchcancel={handleTouchEnd}
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
        class:pointer-events-none={obj.type === 'drawing'}
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
        {:else if obj.type === 'drawing'}
          <DrawingComponent {obj} />
        {/if}
      </div>
    {/each}

    <!-- Current drawing stroke (preview) -->
    {#if $isDrawing && $currentStroke.length > 0}
      <svg class="absolute inset-0 pointer-events-none" style="width: 10000px; height: 10000px; overflow: visible;">
        <path
          d={$currentStroke.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
          stroke={$currentDrawingColor}
          stroke-width={toolWidths[$currentDrawingTool]}
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    {/if}
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