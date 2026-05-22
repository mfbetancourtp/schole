export interface NextStepDto {
  id: number;
  code: string;
  name: string;
  color: string;
}

export interface NextStatusItemDto {
  id: number;
  nextStep: NextStepDto;
}

export interface ScholarshipStatusDto {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  nextStatuses: NextStatusItemDto[];
  totalNextStatuses: number;
  isFinalStatus: boolean | null;
}

export interface ScholarshipStatusPaginatedDto {
  data: ScholarshipStatusDto[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

// Helper para convertir color hex a formato compatible con las clases CSS
export function getColorClass(hexColor: string): string {
  if (!hexColor) return 'gris';
  const hexMap: Record<string, string> = {
    '#f1f5f9': 'gris',
    '#eff6ff': 'azul',
    '#fff7ed': 'naranja',
    '#f0fdf4': 'verde',
    '#fef2f2': 'rojo',
    '#faf5ff': 'purpura',
    '#eef2ff': 'indigo',
    '#fdf2f8': 'rosa',
    '#fffbeb': 'amarillo_P',
    '#ecfdf5': 'cyan',
    '#f7fee7': 'lime',
    '#fce7f3': 'pink',
    '#ffedd5': 'orange',
  };
  return hexMap[hexColor.toLowerCase()] || 'gris';
}

export type BadgeColor = 'gris' | 'azul' | 'naranja' | 'verde' | 'rojo' | 'purpura' | 'indigo' | 'rosa' | 'amarillo_P' | 'cyan' | 'lime' | 'pink' | 'orange';

export const BADGE_COLOR_MAP: Record<BadgeColor, { bg: string; color: string; swatch: string; label: string }> = {
  gris: { bg: '#f1f5f9', color: '#64748b', swatch: '#94a3b8', label: 'Gris' },
  azul: { bg: '#eff6ff', color: '#2563eb', swatch: '#93c5fd', label: 'Azul' },
  naranja: {
    bg: '#fff7ed',
    color: '#ea580c',
    swatch: '#fdba74',
    label: 'Naranja',
  },
  verde: { bg: '#f0fdf4', color: '#16a34a', swatch: '#86efac', label: 'Verde' },
  rojo: { bg: '#fef2f2', color: '#dc2626', swatch: '#fca5a5', label: 'Rojo' },
  purpura: {
    bg: '#faf5ff',
    color: '#9333ea',
    swatch: '#d8b4fe',
    label: 'Púrpura',
  },
  indigo: {
    bg: '#eef2ff',
    color: '#4f46e5',
    swatch: '#a5b4fc',
    label: 'Índigo',
  },
  rosa: { bg: '#fdf2f8', color: '#db2777', swatch: '#f9a8d4', label: 'Rosa' },
  amarillo_P: {
    bg: '#fffbeb',
    color: '#d97706',
    swatch: '#fbbf24',
    label: 'Amarillo',
  },
  cyan: { bg: '#ecfdf5', color: '#0891b2', swatch: '#06b6d4', label: 'Cyan' },
  lime: { bg: '#f7fee7', color: '#65a30d', swatch: '#bef264', label: 'Lima' },
  pink: {
    bg: '#fce7f3',
    color: '#ec4899',
    swatch: '#f472b6',
    label: 'Rosa Claro',
  },
  orange: {
    bg: '#ffedd5',
    color: '#ea580c',
    swatch: '#fb923c',
    label: 'Naranja Claro',
  },
};
