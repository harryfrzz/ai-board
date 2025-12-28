import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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

const storedDrawingTool = browser ? localStorage.getItem('currentDrawingTool') : null;
const initialDrawingTool: DrawingTool = storedDrawingTool ? (storedDrawingTool as DrawingTool) : 'pen';

const storedDrawingColor = browser ? localStorage.getItem('currentDrawingColor') : null;
const initialDrawingColor: string = storedDrawingColor || '#000000';

export const currentDrawingTool = writable<DrawingTool>(initialDrawingTool);
export const currentDrawingColor = writable<string>(initialDrawingColor);
export const isDrawing = writable<boolean>(false);
export const currentStroke = writable<Point[]>([]);

if (browser) {
  currentDrawingTool.subscribe(value => {
    localStorage.setItem('currentDrawingTool', value);
  });
  
  currentDrawingColor.subscribe(value => {
    localStorage.setItem('currentDrawingColor', value);
  });
}

// Tool-specific stroke widths
export const toolWidths: Record<DrawingTool, number> = {
  pen: 2,
  pencil: 1,
  brush: 6
};
