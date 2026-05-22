import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import type { EditorCore, IPlugin, AddTextOptions, AddImageOptions, AddShapeOptions } from '../core';

/**
 * Plugin para añadir elementos básicos al canvas
 */
export class AddBaseTypePlugin implements IPlugin {
  public name = 'AddBaseTypePlugin';
  private editor!: EditorCore;

  initialize(editor: EditorCore): void {
    this.editor = editor;
  }

  destroy(): void {
    this.editor = null as any;
  }

  /**
   * Añadir texto al canvas
   */
  public addText(options: AddTextOptions): void {
    // Obtener el centro del viewport visible
    const center = this.editor.canvas.getCenter();

    // Usamos Textbox para permitir salto de línea automático al redimensionar el ancho
    const text = new fabric.Textbox(options.text || 'Texto [nombre]', {
      left: options.left !== undefined ? options.left : center.left,
      top: options.top !== undefined ? options.top : center.top,
      width: 300, // Ancho inicial por defecto para el wrapping
      fontSize: options.fontSize || 24,
      fontFamily: options.fontFamily || 'Arial',
      fill: options.fill || '#000000',
      fontWeight: options.fontWeight || 'normal',
      fontStyle: options.fontStyle || 'normal',
      textAlign: options.textAlign || 'left',
      originX: 'left',
      originY: 'top',
      splitByGrapheme: true, // Permite partir palabras si es necesario (opcional)
      objectCaching: false,
      id: uuidv4(),
    } as any);

    this.editor.canvas.add(text);
    this.editor.canvas.setActiveObject(text);
    this.editor.canvas.renderAll();
  }

  /**
   * Añadir imagen al canvas
   */
  public async addImage(options: AddImageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Obtener el centro del viewport visible
      const center = this.editor.canvas.getCenter();

      fabric.Image.fromURL(
        options.src,
        (img) => {
          if (!img) {
            reject(new Error('Failed to load image'));
            return;
          }

          img.set({
            left: options.left !== undefined ? options.left : center.left,
            top: options.top !== undefined ? options.top : center.top,
            scaleX: options.scaleX || 1,
            scaleY: options.scaleY || 1,
            originX: 'center',
            originY: 'center',
            id: uuidv4(),
          } as any);

          // Si se especifica width o height, escalar la imagen
          if (options.width || options.height) {
            const width = options.width || img.width!;
            const height = options.height || img.height!;
            img.scaleToWidth(width);
            img.scaleToHeight(height);
          }

          this.editor.canvas.add(img);
          this.editor.canvas.setActiveObject(img);
          this.editor.canvas.renderAll();
          resolve();
        },
        {
          crossOrigin: 'anonymous',
        }
      );
    });
  }

  /**
   * Añadir rectángulo
   */
  public addRectangle(options?: Partial<AddShapeOptions>): void {
    // Obtener el centro del viewport visible
    const center = this.editor.canvas.getCenter();

    const rect = new fabric.Rect({
      left: options?.left !== undefined ? options.left : center.left,
      top: options?.top !== undefined ? options.top : center.top,
      width: options?.width || 200,
      height: options?.height || 150,
      fill: options?.fill || '#2563eb',
      stroke: options?.stroke,
      strokeWidth: options?.strokeWidth || 0,
      originX: 'center',
      originY: 'center',
      id: uuidv4(),
    } as any);

    this.editor.canvas.add(rect);
    this.editor.canvas.setActiveObject(rect);
    this.editor.canvas.renderAll();
  }

  /**
   * Añadir círculo
   */
  public addCircle(options?: Partial<AddShapeOptions>): void {
    // Obtener el centro del viewport visible
    const center = this.editor.canvas.getCenter();

    const circle = new fabric.Circle({
      left: options?.left !== undefined ? options.left : center.left,
      top: options?.top !== undefined ? options.top : center.top,
      radius: options?.radius || 75,
      fill: options?.fill || '#16a34a',
      stroke: options?.stroke,
      strokeWidth: options?.strokeWidth || 0,
      originX: 'center',
      originY: 'center',
      id: uuidv4(),
    } as any);

    this.editor.canvas.add(circle);
    this.editor.canvas.setActiveObject(circle);
    this.editor.canvas.renderAll();
  }

  /**
   * Añadir triángulo
   */
  public addTriangle(options?: Partial<AddShapeOptions>): void {
    // Obtener el centro del viewport visible
    const center = this.editor.canvas.getCenter();

    const triangle = new fabric.Triangle({
      left: options?.left !== undefined ? options.left : center.left,
      top: options?.top !== undefined ? options.top : center.top,
      width: options?.width || 150,
      height: options?.height || 150,
      fill: options?.fill || '#dc2626',
      stroke: options?.stroke,
      strokeWidth: options?.strokeWidth || 0,
      originX: 'center',
      originY: 'center',
      id: uuidv4(),
    } as any);

    this.editor.canvas.add(triangle);
    this.editor.canvas.setActiveObject(triangle);
    this.editor.canvas.renderAll();
  }
}
