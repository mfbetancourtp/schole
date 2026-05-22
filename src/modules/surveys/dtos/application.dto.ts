export type ApplicationStudentType = 'nuevo' | 'antiguo';
export type ApplicationStatus = 'interesado' | 'postulante' | 'ingresante' | 'matriculado' | 'en_proceso' | 'admitido' | 'rechazado' | 'en_espera' | 'retirado';
export type ApplicationWorkflowStepStatus = 'completado' | 'en_curso' | 'pendiente';
export type ApplicationPaymentStatus = 'pagado' | 'pendiente' | 'vencido';
export type ApplicationDocumentStatus = 'aprobado' | 'pendiente' | 'rechazado';
export type ApplicationRecentActivityType = 'workflow' | 'documento' | 'pago' | 'resultado';

export interface ApplicationWorkflowStep {
  id: string;
  nombre: string;
  tipo: string;
  estado: ApplicationWorkflowStepStatus;
  fecha?: string;
  descripcion: string;
}

export interface ApplicationPayment {
  id: string;
  concepto: string;
  monto: number;
  estado: ApplicationPaymentStatus;
  fecha?: string;
  metodoPago?: string;
}

export interface ApplicationDocument {
  id: string;
  nombre: string;
  tipo: string;
  estado: ApplicationDocumentStatus;
  fechaCarga: string;
  tamano: string;
}

export interface ApplicationRecentActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: ApplicationRecentActivityType;
}

export interface ApplicationResult {
  decision: string;
  summary: string;
  observations: string[];
  finalDate?: string;
}

export interface Application {
  id: string;
  fullName: string;
  document: string;
  program: string;
  process: string;
  academicPeriod: string;
  studentType: ApplicationStudentType;
  status: ApplicationStatus;
  progress: number;
  lastActivity: string;
  email: string;
  phone: string;
  registrationDate: string;
  birthDate: string;
  city: string;
  address: string;
  school: string;
  graduationYear: string;
  average: string;
  elapsedDays: number;
  remainingDays: number;
  workflowSteps: ApplicationWorkflowStep[];
  payments: ApplicationPayment[];
  documents: ApplicationDocument[];
  recentActivities: ApplicationRecentActivity[];
  result: ApplicationResult;
}

export interface ApplicationStats {
  total: number;
  inProgress: number;
  admitted: number;
  newStudents: number;
}
