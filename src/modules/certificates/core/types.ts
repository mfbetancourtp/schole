import type { fabric } from 'fabric';
import type { EditorCore } from './EditorCore';

/**
 * Interface base para todos los plugins del editor
 */
export interface IPlugin {
  name: string;
  initialize(editor: EditorCore): void;
  destroy(): void;
}

/**
 * Configuración del editor
 */
export interface EditorConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundImage?: string;
}

/**
 * Configuración de fuentes
 */
export interface FontConfig {
  name: string;
  family: string;
  url?: string;
  category?: 'serif' | 'sans-serif' | 'handwriting' | 'display' | 'monospace';
}

/**
 * Opciones para añadir texto
 */
export interface AddTextOptions {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  left?: number;
  top?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
}

/**
 * Opciones para añadir imagen
 */
export interface AddImageOptions {
  src: string;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
}

/**
 * Opciones para añadir forma
 */
export interface AddShapeOptions {
  type: 'rect' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
}

/**
 * Eventos del editor
 */
export interface EditorEvents {
  'object:added': (obj: fabric.Object) => void;
  'object:modified': (obj: fabric.Object) => void;
  'object:removed': (obj: fabric.Object) => void;
  'selection:created': (obj: fabric.Object | fabric.ActiveSelection) => void;
  'selection:updated': (obj: fabric.Object | fabric.ActiveSelection) => void;
  'selection:cleared': () => void;
  'history:changed': (canUndo: boolean, canRedo: boolean) => void;
}

/**
 * Tipo de evento del editor
 */
export type EditorEventType = keyof EditorEvents;

/**
 * Handler de eventos del editor
 */
export type EditorEventHandler<T extends EditorEventType> = EditorEvents[T];

/**
 * Opciones de alineación
 */
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

/**
 * Opciones de distribución
 */
export type DistributionType = 'horizontal' | 'vertical';

/**
 * Opciones de capa
 */
export type LayerAction = 'bringToFront' | 'sendToBack' | 'bringForward' | 'sendBackward';
