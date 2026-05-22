export interface OperationalSchemeDto {
  id: number;
  programTypeId: number;
  code?: string;
  name: string;
  description: string;
  status: string;
  isActive?: number;
  tags?: string[];
  createdAt: string;

  // Campos de estructura
  classWeeks?: number;
  evaluationWeeks?: number;
  semesters?: number;
  semesterHours?: number;
  credits?: number;
  maximumCredits?: number;
  specificName?: string;

  // Formación en centro
  centerWeeks?: number;
  seminar?: number;
  practicalHours?: number;

  // Operación horas
  theoryHours?: number;
  workshopHours?: number;
  virtualHours?: number;

  // Pasos / etiquetas
  step1?: string;
  step2?: string;
  step3?: string;
  showTypes?: boolean;
}
