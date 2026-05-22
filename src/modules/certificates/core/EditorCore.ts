import { fabric } from 'fabric';
import type { IPlugin, EditorConfig, EditorEventType, EditorEventHandler } from './types';

/**
 * Clase principal del editor de certificados basado en Fabric.js
 */
export class EditorCore {
  public canvas: fabric.Canvas;
  public workspace!: fabric.Rect; // Declarar workspace
  private backgroundImageObject: fabric.Image | null = null; // Capa de imagen de fondo
  private plugins: Map<string, IPlugin>;
  private eventHandlers: Map<string, Set<Function>>;
  private config: EditorConfig;

  constructor(canvasElement: HTMLCanvasElement, config: EditorConfig) {
    this.config = config;
    this.plugins = new Map();
    this.eventHandlers = new Map();

    // Inicializar canvas de Fabric.js
    this.canvas = new fabric.Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: 'transparent', // String válido
      preserveObjectStacking: true,
      selection: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
    });

    // Crear el Workspace (Papel)
    this.workspace = new fabric.Rect({
      width: config.width,
      height: config.height,
      fill: config.backgroundColor || '#ffffff',
      selectable: false,
      hasControls: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'default',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 0,
      }),
      id: 'workspace',
      // Posicionar en 0,0 para que las coordenadas sean relativas al papel
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    } as any);

    this.canvas.add(this.workspace);
    // NO centrar el workspace, dejarlo en 0,0.
    // La cámara se encargará de centrarlo visualmente.

    // Configurar recorte (Clipping)
    // Usamos una función clipPath en el canvas para recortar todo lo que esté fuera del workspace
    this.canvas.clipPath = new fabric.Rect({
      width: config.width,
      height: config.height,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      // absolutePositioned: false // Por defecto es false, lo que significa que es relativo al mundo (se mueve con el zoom/pan)
    });

    // Configuración global de controles
    fabric.Object.prototype.transparentCorners = true;
    fabric.Object.prototype.cornerColor = '#2563eb';
    fabric.Object.prototype.cornerStyle = 'rect';
    fabric.Object.prototype.cornerSize = 12;
    fabric.Object.prototype.borderColor = '#2563eb';
    fabric.Object.prototype.cornerStrokeColor = '#2563eb';
    fabric.Object.prototype.borderDashArray = [4, 4];
    fabric.Object.prototype.padding = 5;

    // Si hay imagen de fondo, establecerla
    if (config.backgroundImage) {
      this.setBackgroundImage(config.backgroundImage);
    }

    // Configurar eventos del canvas
    this.setupCanvasEvents();
  }

  /**
   * Configurar eventos del canvas
   */
  private setupCanvasEvents(): void {
    this.canvas.on('object:added', (e) => {
      if (e.target) {
        this.emit('object:added', e.target);
      }
    });

    this.canvas.on('object:modified', (e) => {
      if (e.target) {
        this.emit('object:modified', e.target);
      }
    });

    this.canvas.on('object:removed', (e) => {
      if (e.target) {
        this.emit('object:removed', e.target);
      }
    });

    this.canvas.on('selection:created', (e) => {
      // Fix: Desactivar caché en la selección múltiple para evitar problemas de renderizado
      // donde los objetos aparecen "fuera" de la caja de selección o desplazados.
      if (e.target && e.target.type === 'activeSelection') {
        e.target.set('objectCaching', false);
        this.canvas.requestRenderAll();
      }

      if (e.target) {
        this.emit('selection:created', e.target);
      }
    });

    this.canvas.on('selection:updated', (e) => {
      if (e.target && e.target.type === 'activeSelection') {
        e.target.set('objectCaching', false);
        this.canvas.requestRenderAll();
      }

      if (e.target) {
        this.emit('selection:updated', e.target);
      }
    });

    this.canvas.on('selection:cleared', () => {
      this.emit('selection:cleared');
    });
  }

  /**
   * Registrar un plugin
   */
  public registerPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
    plugin.initialize(this);
  }

  /**
   * Desregistrar un plugin
   */
  public unregisterPlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(name);
    }
  }

  /**
   * Obtener un plugin por nombre
   */
  public getPlugin<T extends IPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined;
  }

  /**
   * Suscribirse a un evento
   */
  public on<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as Function);
  }

  /**
   * Desuscribirse de un evento
   */
  public off<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as Function);
    }
  }

  /**
   * Emitir un evento
   */
  private emit<T extends EditorEventType>(event: T, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  /**
   * Obtener objeto seleccionado
   */
  public getActiveObject(): fabric.Object | null {
    return this.canvas.getActiveObject() || null;
  }

  /**
   * Obtener objetos seleccionados
   */
  public getActiveObjects(): fabric.Object[] {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return [];

    if (activeObject.type === 'activeSelection') {
      return (activeObject as fabric.ActiveSelection).getObjects();
    }

    return [activeObject];
  }

  /**
   * Establecer tamaño del canvas (Workspace)
   */
  public setSize(width: number, height: number): void {
    this.workspace.set({ width, height });
    this.config.width = width;
    this.config.height = height;

    this.updateClipping();

    // Re-escalar imagen de fondo si existe
    if (this.config.backgroundImage) {
      this.setBackgroundImage(this.config.backgroundImage);
    }

    this.canvas.renderAll();
  }

  /**
   * Centrar el workspace en el canvas usando cálculo manual del viewport
   * Solución robusta para mantener el centrado al redimensionar
   */
  public centerWorkspace(): void {
    if (!this.workspace) return;
    this.setCenterFromObject(this.workspace);
  }

  /**
   * Calcula matemáticamente el viewport para centrar un objeto
   */
  public setCenterFromObject(obj: fabric.Object): void {
    const canvas = this.canvas;
    const objCenter = obj.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;

    // Calcular el desplazamiento necesario para que el centro del objeto coincida con el centro del canvas HTML
    viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];

    canvas.setViewportTransform(viewportTransform);
    canvas.renderAll();
  }

  /**
   * Actualizar la máscara de recorte (Clipping)
   * Clona el workspace y lo usa como clipPath
   */
  public updateClipping(): void {
    if (!this.workspace) return;

    this.workspace.clone((cloned: fabric.Rect) => {
      // El clipPath necesita coordenadas absolutas si absolutePositioned es true,
      // pero aquí queremos que se mueva con el mundo, así que usamos el clon tal cual
      // (que hereda la posición 0,0 del workspace original).

      // Asegurar que el clon no tenga eventos ni selección
      cloned.set({
        selectable: false,
        evented: false,
        absolutePositioned: false, // Importante: relativo al mundo
      });

      this.canvas.clipPath = cloned;
      this.canvas.requestRenderAll();
    });
  }

  /**
   * Establecer color de fondo
   */
  public setBackgroundColor(color: string): void {
    this.workspace.set('fill', color);
    this.config.backgroundColor = color;
    this.canvas.renderAll();
  }

  /**
   * Remover imagen de fondo actual
   */
  private removeBackgroundImage(): void {
    // Buscar por referencia
    if (this.backgroundImageObject) {
      this.canvas.remove(this.backgroundImageObject);
      this.backgroundImageObject = null;
    }

    // Buscar por ID (por si la referencia se perdió)
    const existingBgImage = this.canvas.getObjects().find((obj: any) => obj.id === 'background-image');
    if (existingBgImage) {
      this.canvas.remove(existingBgImage);
    }
  }

  /**
   * Establecer imagen de fondo
   * La imagen se coloca como un objeto bloqueado encima del workspace
   * Esto permite que los PNG transparentes muestren el color de fondo debajo
   */
  public setBackgroundImage(url: string): void {
    const workspaceWidth = this.workspace.width || 0;
    const workspaceHeight = this.workspace.height || 0;

    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) return;

        // Remover imagen de fondo anterior
        this.removeBackgroundImage();

        // Escalar imagen para cubrir todo el workspace
        const scaleX = workspaceWidth / (img.width || 1);
        const scaleY = workspaceHeight / (img.height || 1);
        const scale = Math.max(scaleX, scaleY); // Cubrir completamente

        img.set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          hoverCursor: 'default',
          originX: 'left',
          originY: 'top',
          id: 'background-image',
        } as any);

        // Añadir al canvas justo encima del workspace
        this.canvas.add(img);
        this.backgroundImageObject = img;

        // Asegurar orden: workspace (fondo) -> imagen de fondo -> otros objetos
        this.workspace.sendToBack();
        img.moveTo(1); // Posición 1 (justo después del workspace en posición 0)

        this.config.backgroundImage = url;
        this.canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  /**
   * Limpiar canvas
   */
  public clear(): void {
    this.canvas.clear();
    this.canvas.backgroundColor = this.config.backgroundColor || '#ffffff';
    this.canvas.renderAll();
  }

  /**
   * Exportar a JSON
   * Retorna el JSON nativo de Fabric.js incluyendo propiedades de bloqueo
   */
  public toJSON(): any {
    const propertiesToInclude = ['id', 'selectable', 'hasControls', 'evented', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'hoverCursor'];
    return this.canvas.toJSON(propertiesToInclude);
  }

  /**
   * Importar desde JSON
   * Carga el JSON nativo de Fabric.js directamente
   */
  public fromJSON(json: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.canvas.loadFromJSON(json, () => {
        // Restaurar referencia al workspace
        const workspaceObj = this.canvas.getObjects().find((obj: any) => obj.id === 'workspace');

        if (workspaceObj && workspaceObj instanceof fabric.Rect) {
          this.workspace = workspaceObj;

          // Ya no es necesario re-asignar propiedades de bloqueo porque vienen en el JSON
          // Solo aseguramos que se envíe al fondo y actualizamos el recorte
          this.workspace.sendToBack();

          // Actualizar recorte
          this.updateClipping();

          // Recentrar la cámara en el workspace restaurado
          this.centerWorkspace();
        } else {
          console.warn('Workspace object not found in JSON');
        }

        this.canvas.renderAll();
        resolve();
      });
    });
  }

  /**
   * Destruir editor
   */
  public destroy(): void {
    // Destruir todos los plugins
    this.plugins.forEach((plugin) => plugin.destroy());
    this.plugins.clear();

    // Limpiar event handlers
    this.eventHandlers.clear();

    // Destruir canvas
    this.canvas.dispose();
  }

  /**
   * Obtener configuración
   */
  public getConfig(): EditorConfig {
    return { ...this.config };
  }
}
