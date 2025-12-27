import { writable } from 'svelte/store';

export type Tool = 'pan' | 'select' | 'draw' | 'text' | 'shape' | 'image' | 'pdf' | 'audio' | 'video' | 'link';

export const currentTool = writable<Tool>('pan');
