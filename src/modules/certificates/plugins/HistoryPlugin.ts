import type { EditorCore, IPlugin } from '../core';

/**
 * Plugin para gestionar el historial de cambios (deshacer/rehacer)
 * Usa una implementación simple de historial basada en JSON
 */
export class HistoryPlugin implements IPlugin {
  public name = 'HistoryPlugin';
  private editor: EditorCore | null = null;
  private history: string[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;
  private isUndoRedoing: boolean = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  initialize(editor: EditorCore): void {
    this.editor = editor;
    this.saveState();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  destroy(): void {
    this.removeKeyboardShortcuts();
    this.editor = null;
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Configurar listeners de eventos del canvas
   */
  private setupEventListeners(): void {
    if (!this.editor) return;

    const saveStateHandler = () => {
      if (!this.isUndoRedoing) {
        this.saveState();
      }
    };

    this.editor.canvas.on('object:added', saveStateHandler);
    this.editor.canvas.on('object:modified', saveStateHandler);
    this.editor.canvas.on('object:removed', saveStateHandler);
  }

  /**
   * Configurar atajos de teclado
   */
  private setupKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Z / Cmd+Z - Deshacer
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }

      // Ctrl+Y / Cmd+Y o Ctrl+Shift+Z - Rehacer
      if ((ctrlKey && e.key === 'y') || (ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.redo();
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
   * Guardar estado actual
   */
  private saveState(): void {
    if (!this.editor) return;

    const json = JSON.stringify(this.editor.toJSON());

    // Si no estamos al final del historial, eliminar estados futuros
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Añadir nuevo estado
    this.history.push(json);
    this.currentIndex++;

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    this.emitHistoryChange();
  }

  /**
   * Deshacer último cambio
   */
  public undo(): void {
    if (!this.canUndo() || !this.editor) return;

    this.currentIndex--;
    this.loadState(this.history[this.currentIndex]);
    this.emitHistoryChange();
  }

  /**
   * Rehacer cambio
   */
  public redo(): void {
    if (!this.canRedo() || !this.editor) return;

    this.currentIndex++;
    this.loadState(this.history[this.currentIndex]);
    this.emitHistoryChange();
  }

  /**
   * Cargar estado desde JSON
   */
  private loadState(json: string): void {
    if (!this.editor) return;

    this.isUndoRedoing = true;

    this.editor.fromJSON(JSON.parse(json)).then(() => {
      this.isUndoRedoing = false;
    });
  }

  /**
   * Verificar si se puede deshacer
   */
  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Verificar si se puede rehacer
   */
  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Emitir evento de cambio de historial
   */
  private emitHistoryChange(): void {
    if (!this.editor) return;
    // Emitir evento personalizado para que los componentes Vue puedan reaccionar
    const event = new CustomEvent('history:changed', {
      detail: {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Limpiar historial
   */
  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
    if (this.editor) {
      this.saveState();
    }
  }
}
