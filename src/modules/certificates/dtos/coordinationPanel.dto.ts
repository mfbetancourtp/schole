export type PostulationStatus = 'pending' | 'pending_confirmation' | 'approved' | 'rejected';
export type PostulationType = 'individual' | 'team';
export type WorkModality = 'thesis' | 'degree_project';

export interface CoordinationSummary {
  pending: number;
  approved: number;
  rejected: number;
}

export interface PostulationStudentPreview {
  initials: string;
  name: string;
}

export interface PostulationListItem {
  id: number;
  title: string;
  students: PostulationStudentPreview[];
  studentsLabel: string;
  isTeam: boolean;
  faculty: string;
  date: string;
  status: PostulationStatus;
  modality: WorkModality;
}

export interface CoordinationPanelData {
  summary: CoordinationSummary;
  postulations: PostulationListItem[];
}

export interface StudentDetail {
  initials: string;
  name: string;
  code: string;
  email: string;
  pendingConfirmation?: boolean;
}

export interface TutorAssignment {
  id: number;
  name: string;
  specialty: string;
  requestedByStudent: boolean;
  currentLoad?: string;
}

export interface AttachedDocument {
  id: number;
  fileName: string;
  size: string;
}

export interface PostulationDetail {
  id: number;
  title: string;
  studentsLabel: string;
  status: PostulationStatus;
  students: StudentDetail[];
  faculty: string;
  modality: string;
  date: string;
  type: string;
  description: string;
  tutorAssignment: TutorAssignment | null;
  needsTutorAssignment: boolean;
  documents: AttachedDocument[];
  teamConfirmationPending?: boolean;
}

export interface TutorSelectOption {
  id: number;
  name: string;
  specialty: string;
  currentLoad: string;
}
