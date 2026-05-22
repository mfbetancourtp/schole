export interface DashboardSummary {
  status: string;
  statusDate: string;
  progress: number;
  modality: string;
  modalityDetail: string;
  tutorName: string;
  tutorStatus: string;
}

export type DegreeProjectStatus = 'En Revisión' | 'Pendiente' | 'Activo' | 'Completado';

export interface DegreeProject {
  id: number;
  title: string;
  description: string;
  tags: string[];
  enrollmentDate: string;
  assignedTutor: string;
  status: DegreeProjectStatus;
  dueDate?: string;
}

export interface RecentActivity {
  id: number;
  title: string;
  description: string;
  timeAgo: string;
  type: 'comment' | 'approval' | 'pending';
}

export interface DashboardData {
  summary: DashboardSummary;
  projects: DegreeProject[];
  activities: RecentActivity[];
}
