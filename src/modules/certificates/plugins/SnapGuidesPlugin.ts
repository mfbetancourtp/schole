import { fabric } from 'fabric';
import { IPlugin } from '../core/types';
import { EditorCore } from '../core/EditorCore';

export class SnapGuidesPlugin implements IPlugin {
  public name = 'SnapGuides';
  private canvas: fabric.Canvas | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private aligningLineOffset = 5;
  private aligningLineMargin = 4;
  private alignColor = 'rgba(59, 130, 246, 1)';
  private alignLineWidth = 1;
  private zoom = 1;
  private viewportTransform: number[] | undefined;

  // Cache de líneas a dibujar
  private verticalLines: { x: number; y1: number; y2: number }[] = [];
  private horizontalLines: { y: number; x1: number; x2: number }[] = [];

  // Estado del objeto activo
  private activeLeft = 0;
  private activeTop = 0;
  private activeWidth = 0;
  private activeHeight = 0;

  public initialize(editor: EditorCore): void {
    this.canvas = editor.canvas;
    // Usar el contexto principal para asegurar que se limpie correctamente con cada renderizado
    // Las guías se dibujarán en 'after:render' por encima de los objetos
    this.ctx = this.canvas.getContext();
    this.bindEvents();
  }

  public destroy(): void {
    this.unbindEvents();
  }

  private bindEvents() {
    if (!this.canvas) return;
    this.canvas.on('mouse:down', this.onMouseDown);
    this.canvas.on('object:moving', this.onObjectMoving);
    this.canvas.on('object:scaling', this.onObjectScaling);
    this.canvas.on('before:render', this.onBeforeRender);
    this.canvas.on('after:render', this.onAfterRender);
    this.canvas.on('mouse:up', this.onMouseUp);
  }

  private unbindEvents() {
    if (!this.canvas) return;
    this.canvas.off('mouse:down', this.onMouseDown);
    this.canvas.off('object:moving', this.onObjectMoving);
    this.canvas.off('object:scaling', this.onObjectScaling);
    this.canvas.off('before:render', this.onBeforeRender);
    this.canvas.off('after:render', this.onAfterRender);
    this.canvas.off('mouse:up', this.onMouseUp);
  }

  // Bind methods to maintain context
  private onMouseDown = (e: fabric.IEvent) => {
    if (!this.canvas) return;
    this.viewportTransform = this.canvas.viewportTransform;
    this.zoom = this.canvas.getZoom();
    const target = e.target;
    if (target) {
      this.activeLeft = target.left || 0;
      this.activeTop = target.top || 0;
      this.activeWidth = target.getScaledWidth();
      this.activeHeight = target.getScaledHeight();
    }
  };

  private onMouseUp = () => {
    this.verticalLines.length = 0;
    this.horizontalLines.length = 0;
    this.canvas?.renderAll(); // Force cleanup of lines
  };

  private onBeforeRender = () => {
    // Fabric cleans context automatically usually
  };

  private onAfterRender = () => {
    if (!this.ctx || !this.viewportTransform) return;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = this.alignLineWidth;
    this.ctx.strokeStyle = this.alignColor;
    this.ctx.setLineDash([4, 4]); // Línea recortada / Dashed

    // Dibujar líneas verticales
    for (const line of this.verticalLines) {
      this.drawLine(line.x, line.y1, line.x, line.y2);
    }

    // Dibujar líneas horizontales
    for (const line of this.horizontalLines) {
      this.drawLine(line.x1, line.y, line.x2, line.y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  };

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!this.viewportTransform || !this.ctx) return;

    const originX = this.viewportTransform[4];
    const originY = this.viewportTransform[5];

    this.ctx.moveTo(x1 * this.zoom + originX, y1 * this.zoom + originY);
    this.ctx.lineTo(x2 * this.zoom + originX, y2 * this.zoom + originY);
  }

  private isInRange(value1: number, value2: number): boolean {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    return Math.abs(value1 - value2) <= this.aligningLineMargin;
  }

  private onObjectMoving = (e: fabric.IEvent) => {
    if (!this.viewportTransform || !e.target || !this.canvas) return;

    const activeObject = e.target;
    const canvasObjects = this.canvas.getObjects();

    // --- COORDENADAS OBJETO ACTIVO ---
    const activeCenter = activeObject.getCenterPoint();
    // Declarar variables antes de usar
    const activeObjectWidth = activeObject.getScaledWidth();
    const activeObjectHeight = activeObject.getScaledHeight();

    const activeLeft = activeCenter.x - activeObjectWidth / 2;
    const activeRight = activeCenter.x + activeObjectWidth / 2;
    const activeTop = activeCenter.y - activeObjectHeight / 2;
    const activeBottom = activeCenter.y + activeObjectHeight / 2;

    this.horizontalLines.length = 0;
    this.verticalLines.length = 0;

    let horizontalInTheRange = false;
    let verticalInTheRange = false;

    // Helper para Snap
    // alignType: 'center', 'left', 'right', 'top', 'bottom'
    const snap = (pos: number, originX: string, originY: string) => {
      // En fabric v5 setPositionByOrigin es robusto
      activeObject.setPositionByOrigin(
        new fabric.Point(originX === 'vertical' ? pos : activeCenter.x, originY === 'horizontal' ? pos : activeCenter.y),
        originX === 'vertical' ? 'center' : (originX as any),
        originY === 'horizontal' ? 'center' : (originY as any)
      );
    };

    // Iterar sobre otros objetos
    for (let i = canvasObjects.length; i--; ) {
      const obj = canvasObjects[i];
      if (obj === activeObject) continue;

      // Filtrar guías o items bloqueados si se desea
      // if (obj.lockMovementX && obj.lockMovementY) continue;

      const objCenter = obj.getCenterPoint();
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();

      const objLeft = objCenter.x - objWidth / 2;
      const objRight = objCenter.x + objWidth / 2;
      const objTop = objCenter.y - objHeight / 2;
      const objBottom = objCenter.y + objHeight / 2;

      // --- SNAP VERTICAL (Alinear X) - Guías Verticales ---

      // 1. Centro con Centro
      if (this.isInRange(objCenter.x, activeCenter.x)) {
        verticalInTheRange = true;
        this.addVerticalLine(objCenter.x, objTop, objHeight, activeTop, activeObjectHeight);
        activeObject.setPositionByOrigin(new fabric.Point(objCenter.x, activeCenter.y), 'center', 'center');
      }

      // 2. Izquierda con Izquierda
      if (this.isInRange(objLeft, activeLeft)) {
        verticalInTheRange = true;
        this.addVerticalLine(objLeft, objTop, objHeight, activeTop, activeObjectHeight);
        activeObject.setPositionByOrigin(new fabric.Point(objLeft, activeCenter.y), 'left', 'center');
      }

      // 3. Derecha con Derecha
      if (this.isInRange(objRight, activeRight)) {
        verticalInTheRange = true;
        this.addVerticalLine(objRight, objTop, objHeight, activeTop, activeObjectHeight);
        activeObject.setPositionByOrigin(new fabric.Point(objRight, activeCenter.y), 'right', 'center');
      }

      // 4. Izquierda con Derecha (objeto activo a la derecha del objetivo)
      if (this.isInRange(objRight, activeLeft)) {
        verticalInTheRange = true;
        this.addVerticalLine(objRight, objTop, objHeight, activeTop, activeObjectHeight);
        activeObject.setPositionByOrigin(new fabric.Point(objRight, activeCenter.y), 'left', 'center');
      }

      // 5. Derecha con Izquierda (objeto activo a la izquierda del objetivo)
      if (this.isInRange(objLeft, activeRight)) {
        verticalInTheRange = true;
        this.addVerticalLine(objLeft, objTop, objHeight, activeTop, activeObjectHeight);
        activeObject.setPositionByOrigin(new fabric.Point(objLeft, activeCenter.y), 'right', 'center');
      }

      // --- SNAP HORIZONTAL (Alinear Y) - Guías Horizontales ---

      // 1. Centro con Centro
      if (this.isInRange(objCenter.y, activeCenter.y)) {
        horizontalInTheRange = true;
        this.addHorizontalLine(objCenter.y, objLeft, objWidth, activeLeft, activeObjectWidth);
        activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, objCenter.y), 'center', 'center');
      }

      // 2. Arriba con Arriba
      if (this.isInRange(objTop, activeTop)) {
        horizontalInTheRange = true;
        this.addHorizontalLine(objTop, objLeft, objWidth, activeLeft, activeObjectWidth);
        activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, objTop), 'center', 'top');
      }

      // 3. Abajo con Abajo
      if (this.isInRange(objBottom, activeBottom)) {
        horizontalInTheRange = true;
        this.addHorizontalLine(objBottom, objLeft, objWidth, activeLeft, activeObjectWidth);
        activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, objBottom), 'center', 'bottom');
      }

      // 4. Arriba con Abajo (Top activo con Bottom objetivo)
      if (this.isInRange(objBottom, activeTop)) {
        horizontalInTheRange = true;
        this.addHorizontalLine(objBottom, objLeft, objWidth, activeLeft, activeObjectWidth);
        activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, objBottom), 'center', 'top');
      }

      // 5. Abajo con Arriba (Bottom activo con Top objetivo)
      if (this.isInRange(objTop, activeBottom)) {
        horizontalInTheRange = true;
        this.addHorizontalLine(objTop, objLeft, objWidth, activeLeft, activeObjectWidth);
        activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, objTop), 'center', 'bottom');
      }
    }

    // Snap al centro del Canvas
    const canvasCenter = this.canvas.getCenter();

    // Centro Horizontal
    if (this.isInRange(canvasCenter.left, activeCenter.x)) {
      verticalInTheRange = true;
      this.addVerticalLine(canvasCenter.left, 0, this.canvas.getHeight(), activeTop, activeObjectHeight);
      activeObject.setPositionByOrigin(new fabric.Point(canvasCenter.left, activeCenter.y), 'center', 'center');
    }

    // Centro Vertical
    if (this.isInRange(canvasCenter.top, activeCenter.y)) {
      horizontalInTheRange = true;
      this.addHorizontalLine(canvasCenter.top, 0, this.canvas.getWidth(), activeLeft, activeObjectWidth);
      activeObject.setPositionByOrigin(new fabric.Point(activeCenter.x, canvasCenter.top), 'center', 'center');
    }

    // Limpiar arrays si no hubo match
    if (!horizontalInTheRange) this.horizontalLines.length = 0;
    if (!verticalInTheRange) this.verticalLines.length = 0;
  };

  private onObjectScaling = (e: fabric.IEvent) => {
    // Por ahora dejamos vacio, similar a moving si se desea snap al escalar
  };

  private addVerticalLine(x: number, y1_c: number, h1: number, y2_c: number, h2: number) {
    const y1_top = y1_c - h1 / 2;
    const y1_bot = y1_c + h1 / 2;
    const y2_top = y2_c - h2 / 2;
    const y2_bot = y2_c + h2 / 2;

    this.verticalLines.push({
      x: x,
      y1: Math.min(y1_top, y2_top) - this.aligningLineOffset,
      y2: Math.max(y1_bot, y2_bot) + this.aligningLineOffset,
    });
  }

  private addHorizontalLine(y: number, x1_c: number, w1: number, x2_c: number, w2: number) {
    const x1_left = x1_c - w1 / 2;
    const x1_right = x1_c + w1 / 2;
    const x2_left = x2_c - w2 / 2;
    const x2_right = x2_c + w2 / 2;

    this.horizontalLines.push({
      y: y,
      x1: Math.min(x1_left, x2_left) - this.aligningLineOffset,
      x2: Math.max(x1_right, x2_right) + this.aligningLineOffset,
    });
  }
}
