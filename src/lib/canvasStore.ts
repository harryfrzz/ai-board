import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';

export type CanvasObjectType = 'text' | 'shape' | 'image' | 'pdf' | 'audio' | 'video' | 'link' | 'drawing';

export interface CanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
  selected?: boolean;
}

const storedObjects = browser ? localStorage.getItem('canvasObjects') : null;
const initialObjects: CanvasObject[] = storedObjects ? JSON.parse(storedObjects) : [];

export const canvasObjects = writable<CanvasObject[]>(initialObjects);

// Save to localStorage whenever the store changes
if (browser) {
  canvasObjects.subscribe(value => {
    console.log('Saving to localStorage:', value);
    localStorage.setItem('canvasObjects', JSON.stringify(value));
  });
}

export function addObject(obj: Omit<CanvasObject, 'id'>) {
  const newObj: CanvasObject = {
    ...obj,
    id: uuidv4(),
  };
  canvasObjects.update(objects => [...objects, newObj]);
  return newObj.id;
}

export function removeObject(id: string) {
  canvasObjects.update(objects => objects.filter(obj => obj.id !== id));
}

export function updateObject(id: string, updates: Partial<CanvasObject>) {
  canvasObjects.update(objects =>
    objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
  );
}

export function selectObject(id: string) {
  canvasObjects.update(objects =>
    objects.map(obj => ({ ...obj, selected: obj.id === id }))
  );
}

export function deselectAll() {
  canvasObjects.update(objects =>
    objects.map(obj => ({ ...obj, selected: false }))
  );
}
