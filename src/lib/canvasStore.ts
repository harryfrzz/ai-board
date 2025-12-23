import { writable } from 'svelte/store';

export interface CanvasObject {
  id: string;
  type: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
  selected?: boolean;
}

export const canvasObjects = writable<CanvasObject[]>([]);

export function addObject(obj: Omit<CanvasObject, 'id'>) {
  const newObj: CanvasObject = {
    ...obj,
    id: crypto.randomUUID(),
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
