import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Tool = 'pan' | 'select' | 'draw' | 'text' | 'shape' | 'media' | 'image' | 'pdf' | 'audio' | 'video' | 'link';

const storedTool = browser ? localStorage.getItem('currentTool') : null;
const initialTool: Tool = storedTool ? (storedTool as Tool) : 'pan';

export const currentTool = writable<Tool>(initialTool);

if (browser) {
  currentTool.subscribe(value => {
    localStorage.setItem('currentTool', value);
  });
}
