import { writable } from 'svelte/store';

export type DrawingTool = 'pen' | 'pencil' | 'brush';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: Point[];
  color: string;
  tool: DrawingTool;
  width: number;
}

export const currentDrawingTool = writable<DrawingTool>('pen');
export const currentDrawingColor = writable<string>('#000000');
export const isDrawing = writable<boolean>(false);
export const currentStroke = writable<Point[]>([]);

// Tool-specific stroke widths
export const toolWidths: Record<DrawingTool, number> = {
  pen: 2,
  pencil: 1,
  brush: 6
};
