import type { EditorCore, IPlugin, EditorConfig } from '../core';

/**
 * Plugin para gestionar el área de trabajo (workspace)
 * Controla las dimensiones del canvas, fondo, zoom, etc.
 */
export class WorkspacePlugin implements IPlugin {
  public name = 'WorkspacePlugin';
  private editor: EditorCore | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
  }

  destroy(): void {
    this.editor = null;
  }

  /**
   * Establecer dimensiones del canvas
   */
  public setCanvasSize(width: number, height: number): void {
    if (!this.editor) return;
    this.editor.setSize(width, height);
  }

  /**
   * Establecer formato predefinido
   */
  public setFormat(format: 'A4' | 'US_LETTER' | 'CUSTOM', landscape: boolean = true, customSize?: { width: number; height: number }): void {
    if (!this.editor) return;

    let width: number, height: number;

    switch (format) {
      case 'A4':
        width = landscape ? 1123 : 794;
        height = landscape ? 794 : 1123;
        break;
      case 'US_LETTER':
        width = landscape ? 1056 : 816;
        height = landscape ? 816 : 1056;
        break;
      case 'CUSTOM':
        if (!customSize) return;
        width = customSize.width;
        height = customSize.height;
        break;
      default:
        return;
    }

    this.setCanvasSize(width, height);
  }

  /**
   * Establecer color de fondo
   */
  public setBackgroundColor(color: string): void {
    if (!this.editor) return;
    this.editor.setBackgroundColor(color);
  }

  /**
   * Establecer imagen de fondo
   */
  public setBackgroundImage(url: string): void {
    if (!this.editor) return;
    this.editor.setBackgroundImage(url);
  }

  /**
   * Limpiar fondo (establecer blanco)
   */
  public clearBackground(): void {
    if (!this.editor) return;
    this.editor.setBackgroundColor('#ffffff');
  }

  /**
   * Obtener dimensiones actuales
   */
  public getCanvasSize(): { width: number; height: number } {
    if (!this.editor) return { width: 0, height: 0 };
    const config = this.editor.getConfig();
    return {
      width: this.editor.workspace?.width || config.width || 0,
      height: this.editor.workspace?.height || config.height || 0,
    };
  }

  /**
   * Centrar vista (útil después de zoom)
   */
  public centerView(): void {
    if (!this.editor) return;
    this.editor.canvas.viewportCenterObject(this.editor.canvas.getActiveObject()!);
    this.editor.canvas.renderAll();
  }
}
