export type JuryAssignmentStatus = 'complete' | 'partial' | 'unassigned';

export type JuryAssignmentStatusApi = 'Completo' | 'Parcial' | 'Sin Asignar';

export type WorkModalityJury = 'thesis' | 'degree_project';

export type JuryRole = 'president' | 'vocal_1' | 'vocal_2';

export type JuryMemberConfirmation = 'confirmed' | 'pending';

export interface JuryAssignmentSummary {
  complete: number;
  partial: number;
  unassigned: number;
}

export interface JuryProjectListItem {
  id: number;
  title: string;
  status: JuryAssignmentStatus;
  modality: WorkModalityJury;
  studentName: string;
  tutorName: string;
  assignedCount: number;
  totalRequired: number;
}

export interface JuryAssignmentPanelData {
  summary: JuryAssignmentSummary;
  projects: JuryProjectListItem[];
}

export interface JuryPeopleApi {
  names: string;
  lastnames: string;
  email?: string;
}

export interface JuryUserApi {
  id: number;
  people: JuryPeopleApi;
}

export interface TeacherForSelectApi {
  id: number;
  people: JuryPeopleApi;
}

export interface JuryApplicationProjectApi {
  id: number;
  name: string;
  applicationType: string;
  status: string;
  user: JuryUserApi;
}

export interface ApplicationProjectJuryApiItem {
  id: number;
  status: JuryAssignmentStatusApi;
  createdAt: string;
  updatedAt: string;
  applicationProject: JuryApplicationProjectApi;
  user: JuryUserApi;
}

export interface ApplicationProjectJuryRelationApi {
  id: number;
  createdAt: string;
  updatedAt: string;
  jury: JuryUserApi;
}

export interface ApplicationProjectWithJuriesApiItem {
  id: number;
  name: string;
  applicationType: string;
  status: string;
  user: JuryUserApi;
  juries: ApplicationProjectJuryRelationApi[];
  juryStatus: JuryAssignmentStatusApi;
}

export interface CreateApplicationProjectJuryBodyDto {
  applicationProjectsId: number;
  userId: number;
}

export interface CurrentJuryMember {
  id: number;
  name: string;
  role: JuryRole;
  confirmationStatus: JuryMemberConfirmation;
  relationId?: number;
}

export interface EvaluatorOption {
  id: number;
  name: string;
  department: string;
  specialties: string[];
  activeProjects: number;
}

export interface SelectedEvaluator {
  evaluatorId: number;
  role: JuryRole;
}

export interface JuryProjectDetail {
  id: number;
  title: string;
  studentName: string;
  tutorName: string;
  faculty: string;
  modality: WorkModalityJury;
  status: JuryAssignmentStatus;
  currentJury: CurrentJuryMember[];
  preSelectedEvaluators: SelectedEvaluator[];
}
