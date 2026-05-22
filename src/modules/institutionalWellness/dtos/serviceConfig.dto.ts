export type ServiceConfigStatus = 'active' | 'inactive';

export interface ServiceResponsible {
  name: string;
  email: string;
  role: string;
}

export interface ServiceConfig {
  id: number;
  icon: string;
  iconLabel: string;
  name: string;
  description: string;
  status: ServiceConfigStatus;
  pendingCount: number;
  requirements: string[];
  responsibles: ServiceResponsible[];
}

export interface ServiceConfigForm {
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  responsibles: ServiceResponsible[];
}

export interface ServiceIconOption {
  icon: string;
  label: string;
}

export const SERVICE_ICON_OPTIONS: ServiceIconOption[] = [
  { icon: 'brain', label: 'Psicología' },
  { icon: 'heart', label: 'Salud' },
  { icon: 'comment', label: 'Orientación' },
  { icon: 'user-friends', label: 'Trabajo Social' },
  { icon: 'running', label: 'Deportes' },
  { icon: 'tablet-alt', label: 'Académico' },
  { icon: 'briefcase', label: 'Profesional' },
  { icon: 'trophy', label: 'Recreación' },
];

export const STUDENT_REQUIREMENTS: string[] = [
  'Carné estudiantil vigente',
  'Semestre mínimo cursado (3er semestre)',
  'Formato de solicitud firmado',
  'Autorización de tutor (menores de edad)',
  'Certificado médico reciente',
  'Comprobante de matrícula',
];

export const RESPONSIBLE_ROLES: string[] = ['Coordinador', 'Psicólogo', 'Médico', 'Orientador', 'Trabajador Social', 'Docente', 'Administrativo'];
