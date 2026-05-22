import type { EditorCore, IPlugin, LayerAction } from '../core';

/**
 * Plugin para gestionar capas (z-index)
 */
export class LayerPlugin implements IPlugin {
  public name = 'LayerPlugin';
  private editor: EditorCore | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
  }

  destroy(): void {
    this.editor = null;
  }

  /**
   * Asegurar que el workspace siempre esté al fondo
   */
  private fixWorkspace(): void {
    if (!this.editor) return;
    const workspace = this.editor.canvas.getObjects().find((o: any) => o.id === 'workspace');
    if (workspace) {
      workspace.sendToBack();
    }
  }

  /**
   * Traer objeto al frente
   */
  public bringToFront(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    this.editor.canvas.bringToFront(target);
    this.fixWorkspace(); // Re-asegurar el fondo
    this.editor.canvas.renderAll();
  }

  /**
   * Enviar objeto atrás
   */
  public sendToBack(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    target.sendToBack();
    // El workspace quedará detrás de esto, así que lo enviamos al fondo de nuevo
    this.fixWorkspace();
    this.editor.canvas.renderAll();
  }

  /**
   * Subir una capa
   */
  public bringForward(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    this.editor.canvas.bringForward(target);
    this.editor.canvas.renderAll();
  }

  /**
   * Bajar una capa
   */
  public sendBackward(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    // Verificar si el objeto está justo encima del workspace
    const objects = this.editor.canvas.getObjects();
    const index = objects.indexOf(target);
    // Asumimos que el workspace está en 0. Si index es 1, no deberíamos bajarlo más.
    // Pero fixWorkspace se encargará de corregirlo si baja demasiado.

    this.editor.canvas.sendBackwards(target);
    this.fixWorkspace();
    this.editor.canvas.renderAll();
  }

  /**
   * Ejecutar acción de capa
   */
  public executeLayerAction(action: LayerAction, obj?: fabric.Object): void {
    switch (action) {
      case 'bringToFront':
        this.bringToFront(obj);
        break;
      case 'sendToBack':
        this.sendToBack(obj);
        break;
      case 'bringForward':
        this.bringForward(obj);
        break;
      case 'sendBackward':
        this.sendBackward(obj);
        break;
    }
  }

  /**
   * Obtener todos los objetos ordenados por z-index
   */
  public getObjectsOrdered(): fabric.Object[] {
    if (!this.editor) return [];
    return this.editor.canvas.getObjects();
  }

  /**
   * Reordenar objetos
   */
  public reorderObjects(objects: fabric.Object[]): void {
    if (!this.editor) return;

    // Limpiar canvas
    this.editor.canvas.clear();

    // Añadir objetos en el nuevo orden
    objects.forEach((obj) => {
      this.editor!.canvas.add(obj);
    });

    this.editor.canvas.renderAll();
  }

  /**
   * Obtener índice de un objeto
   */
  public getObjectIndex(obj: fabric.Object): number {
    if (!this.editor) return -1;
    return this.editor.canvas.getObjects().indexOf(obj);
  }

  /**
   * Mover objeto a índice específico
   */
  public moveObjectToIndex(obj: fabric.Object, index: number): void {
    if (!this.editor) return;

    const objects = this.editor.canvas.getObjects();
    const currentIndex = objects.indexOf(obj);

    if (currentIndex === -1 || index < 0 || index >= objects.length) {
      return;
    }

    // Remover objeto de su posición actual
    objects.splice(currentIndex, 1);

    // Insertar en nueva posición
    objects.splice(index, 0, obj);

    // Reordenar
    this.reorderObjects(objects);
  }
}
