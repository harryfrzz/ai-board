<script lang="ts">
  import type { CanvasObject } from '$lib/canvasStore';
  import type { DrawingStroke } from '$lib/drawingStore';

  let { obj }: { obj: CanvasObject } = $props();

  function getStrokePath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }
</script>

<svg 
  class="w-full h-full absolute inset-0 pointer-events-none"
  style="overflow: visible;"
>
  {#each (obj.data.strokes || []) as stroke (stroke.id)}
    <path
      d={getStrokePath(stroke.points)}
      stroke={stroke.color}
      stroke-width={stroke.width}
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  {/each}
</svg>
