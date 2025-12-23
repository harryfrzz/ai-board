import { writable } from 'svelte/store';

export type Tool = 'pan' | 'select' | 'draw' | 'text' | 'shape' | 'image' | 'pdf' | 'audio' | 'video';

export const currentTool = writable<Tool>('pan');
