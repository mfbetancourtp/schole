import type { EditorCore, IPlugin } from '../core';

/**
 * Plugin para copiar, cortar y pegar elementos
 */
export class CopyPlugin implements IPlugin {
  public name = 'CopyPlugin';
  private editor: EditorCore | null = null;
  private clipboard: fabric.Object | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
    this.setupKeyboardShortcuts();
  }

  destroy(): void {
    this.removeKeyboardShortcuts();
    this.editor = null;
    this.clipboard = null;
  }

  /**
   * Configurar atajos de teclado
   */
  private setupKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ignorar si estamos editando texto
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+C / Cmd+C - Copiar
      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        this.copy();
      }

      // Ctrl+X / Cmd+X - Cortar
      if (ctrlKey && e.key === 'x') {
        e.preventDefault();
        this.cut();
      }

      // Ctrl+V / Cmd+V - Pegar
      if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        this.paste();
      }

      // Ctrl+D / Cmd+D - Duplicar
      if (ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.duplicate();
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
   * Copiar objeto seleccionado
   */
  public copy(): void {
    if (!this.editor) return;

    const activeObject = this.editor.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned: fabric.Object) => {
      this.clipboard = cloned;
    });
  }

  /**
   * Cortar objeto seleccionado
   */
  public cut(): void {
    if (!this.editor) return;

    const activeObject = this.editor.getActiveObject();
    if (!activeObject) return;

    this.copy();
    this.editor.canvas.remove(activeObject);
    this.editor.canvas.renderAll();
  }

  /**
   * Pegar objeto del clipboard
   */
  public paste(): void {
    if (!this.editor || !this.clipboard) return;

    this.clipboard.clone((cloned: fabric.Object) => {
      if (!this.editor) return;

      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        evented: true,
      });

      if (cloned.type === 'activeSelection') {
        // Si es una selección múltiple
        (cloned as any).canvas = this.editor.canvas;
        (cloned as any).forEachObject((obj: fabric.Object) => {
          this.editor!.canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        this.editor.canvas.add(cloned);
      }

      this.clipboard = cloned;
      this.editor.canvas.setActiveObject(cloned);
      this.editor.canvas.renderAll();
    });
  }

  /**
   * Duplicar objeto seleccionado
   */
  public duplicate(): void {
    this.copy();
    this.paste();
  }

  /**
   * Verificar si hay algo en el clipboard
   */
  public hasClipboard(): boolean {
    return this.clipboard !== null;
  }
}
