import type { EditorCore, IPlugin } from '../core';

/**
 * Plugin para eliminar elementos con teclas Delete/Backspace
 */
export class DeleteHotKeyPlugin implements IPlugin {
  public name = 'DeleteHotKeyPlugin';
  private editor: EditorCore | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
    this.setupKeyboardShortcuts();
  }

  destroy(): void {
    this.removeKeyboardShortcuts();
    this.editor = null;
  }

  /**
   * Configurar atajos de teclado
   */
  private setupKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // Ignorar si estamos editando texto
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Delete o Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteSelected();
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Remover atajos de teclado
   */
  private removeKeyboardShortcuts(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  /**
   * Eliminar objeto(s) seleccionado(s)
   */
  public deleteSelected(): void {
    if (!this.editor) return;

    const activeObjects = this.editor.getActiveObjects();
    if (activeObjects.length === 0) return;

    // Filtrar y eliminar solo objetos que no sean el workspace
    activeObjects.forEach((obj) => {
      // No eliminar el workspace
      if ((obj as any).id === 'workspace') {
        console.warn('No se puede eliminar el workspace');
        return;
      }
      this.editor!.canvas.remove(obj);
    });

    // Limpiar la selección y re-renderizar
    this.editor.canvas.discardActiveObject();
    this.editor.canvas.requestRenderAll();
  }

  /**
   * Eliminar objeto específico
   */
  public deleteObject(obj: fabric.Object): void {
    if (!this.editor) return;

    // No eliminar el workspace
    if ((obj as any).id === 'workspace') {
      console.warn('No se puede eliminar el workspace');
      return;
    }

    this.editor.canvas.remove(obj);

    // Limpiar la selección y re-renderizar
    this.editor.canvas.discardActiveObject();
    this.editor.canvas.requestRenderAll();
  }

  /**
   * Eliminar todos los objetos (excepto el workspace)
   */
  public deleteAll(): void {
    if (!this.editor) return;

    const objects = this.editor.canvas.getObjects();
    objects.forEach((obj) => {
      // No eliminar el workspace
      if ((obj as any).id === 'workspace') {
        return;
      }
      this.editor!.canvas.remove(obj);
    });

    // Limpiar la selección y re-renderizar
    this.editor.canvas.discardActiveObject();
    this.editor.canvas.requestRenderAll();
  }
}
