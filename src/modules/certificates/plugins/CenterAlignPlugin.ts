import type { EditorCore, IPlugin, AlignmentType } from '../core';

/**
 * Plugin para alinear elementos
 */
export class CenterAlignPlugin implements IPlugin {
  public name = 'CenterAlignPlugin';
  private editor: EditorCore | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
  }

  destroy(): void {
    this.editor = null;
  }

  /**
   * Centrar objeto horizontalmente
   */
  public centerHorizontally(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    const workspaceWidth = this.editor.workspace?.width || this.editor.getConfig().width || 0;
    target.centerH(); // Fabric method centers relative to canvas, but since workspace is 0,0 and canvas covers it...
    // Wait, target.centerH() uses canvas.width. We need to center relative to workspace.

    const targetWidth = target.getScaledWidth();
    target.set({ left: (workspaceWidth - targetWidth) / 2 });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Centrar objeto verticalmente
   */
  public centerVertically(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    const workspaceHeight = this.editor.workspace?.height || this.editor.getConfig().height || 0;
    const targetHeight = target.getScaledHeight();
    target.set({ top: (workspaceHeight - targetHeight) / 2 });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Centrar objeto en el canvas (Workspace)
   */
  public center(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    this.centerHorizontally(target);
    this.centerVertically(target);
  }

  /**
   * Alinear a la izquierda
   */
  public alignLeft(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    target.set({ left: 0 });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Alinear a la derecha
   */
  public alignRight(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    const workspaceWidth = this.editor.workspace?.width || this.editor.getConfig().width || 0;
    const objWidth = target.getScaledWidth();
    target.set({ left: workspaceWidth - objWidth });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Alinear arriba
   */
  public alignTop(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    target.set({ top: 0 });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Alinear abajo
   */
  public alignBottom(obj?: fabric.Object): void {
    if (!this.editor) return;

    const target = obj || this.editor.getActiveObject();
    if (!target) return;

    const workspaceHeight = this.editor.workspace?.height || this.editor.getConfig().height || 0;
    const objHeight = target.getScaledHeight();
    target.set({ top: workspaceHeight - objHeight });
    target.setCoords();
    this.editor.canvas.renderAll();
  }

  /**
   * Ejecutar alineación
   */
  public align(type: AlignmentType, obj?: fabric.Object): void {
    switch (type) {
      case 'left':
        this.alignLeft(obj);
        break;
      case 'center':
        this.centerHorizontally(obj);
        break;
      case 'right':
        this.alignRight(obj);
        break;
      case 'top':
        this.alignTop(obj);
        break;
      case 'middle':
        this.centerVertically(obj);
        break;
      case 'bottom':
        this.alignBottom(obj);
        break;
    }
  }
}
