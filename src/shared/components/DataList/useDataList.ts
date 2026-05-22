import type { InjectionKey, VNode } from 'vue';
import { reactive } from 'vue';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type ColumnPosition = 'left' | 'center' | 'right';

export interface ColumnDef {
  /** ID único generado internamente */
  id: string;
  /** Texto de la cabecera */
  label: string;
  /** Clave del campo en el objeto de datos (para ordenamiento automático) */
  field?: string;
  /** Ancho fijo de la columna (px o string CSS) */
  width?: string | number;
  /** Permite ordenar por esta columna */
  sortable?: boolean;
  /** Alineación de celda y cabecera */
  position?: ColumnPosition;
  /** Fija la columna al lado izquierdo con sticky */
  sticky?: boolean;
  /** Oculta la columna sin desregistrarla */
  visible?: boolean;
  /** Función de render de celda — devuelve los VNodes del slot del hijo */
  renderCell: (row: unknown, index: number) => VNode[] | undefined;
  /** Función de render de cabecera personalizada (slot #header del hijo) */
  renderHeader?: () => VNode[] | undefined;
}

// ─── Contexto de inyección ────────────────────────────────────────────────────

export interface DataListContext {
  registerColumn: (col: ColumnDef) => void;
  unregisterColumn: (id: string) => void;
  updateColumn: (id: string, partial: Partial<Omit<ColumnDef, 'id'>>) => void;
}

export const DATA_LIST_KEY: InjectionKey<DataListContext> = Symbol('AppDataList');

// ─── Factory del contexto (usado en AppDataList.vue) ─────────────────────────

export function createDataListContext(columns: ColumnDef[]): DataListContext {
  return {
    registerColumn(col: ColumnDef) {
      const exists = columns.findIndex((c) => c.id === col.id);
      if (exists === -1) columns.push(reactive(col) as ColumnDef);
    },
    unregisterColumn(id: string) {
      const idx = columns.findIndex((c) => c.id === id);
      if (idx !== -1) columns.splice(idx, 1);
    },
    updateColumn(id: string, partial: Partial<Omit<ColumnDef, 'id'>>) {
      const col = columns.find((c) => c.id === id);
      if (col) Object.assign(col, partial);
    },
  };
}

// ─── Helper para generar IDs únicos de columna ────────────────────────────────

let _colCounter = 0;
export function generateColumnId(): string {
  return `adl-col-${++_colCounter}`;
}
