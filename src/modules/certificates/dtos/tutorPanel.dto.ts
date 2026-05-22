export type ProjectStatus = 'pending_review' | 'in_progress' | 'completed';

export interface TutorPanelSummary {
  totalProjects: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface StudentInfo {
  initials: string;
  name: string;
}

export interface TutorProject {
  id: number;
  title: string;
  modality: 'thesis' | 'degree_project';
  status: ProjectStatus;
  progress: number;
  students: StudentInfo[];
  teamSize: number;
  currentChapter: string;
  lastUpdate: string;
  pendingDeliveries: number;
}

export interface TutorPanelData {
  summary: TutorPanelSummary;
  projects: TutorProject[];
}

export interface PendingDelivery {
  id: number;
  comment: string;
  fileUrl: string;
  createdAt: string;
  milestone: {
    id: number;
    status: string;
    scheduleSettingsMilestone: {
      id: number;
      name: string;
    };
  };
}

export interface ProjectReviewDetail {
  projectId: number;
  title: string;
  students: string;
  modality: string;
  progress: number;
  currentChapter: string;
  teamSize: number;
  deliveries: PendingDelivery[];
}

export type ApplicationProjectsMilestonesReviewStatus = 'Completado' | 'Corrección';

export interface CreateOrUpdateApplicationProjectsMilestonesReviewDto {
  applicationProjectsMilestonesId: number;
  feedback: string | null;
  status: ApplicationProjectsMilestonesReviewStatus;
}

export type TutorPanelMilestoneStatus = 'Pendiente' | 'En Progreso' | 'En Revisión' | 'Completado';

export interface TutorPanelPersonApi {
  names: string;
  lastnames: string;
  email?: string;
}

export interface TutorPanelUserApi {
  id: number;
  people: TutorPanelPersonApi;
}

export interface TutorPanelProjectMemberApi {
  id: number;
  user: TutorPanelUserApi;
}

export interface TutorPanelScheduleSettingsApi {
  name: string;
}

export interface TutorPanelScheduleSettingsMilestoneApi {
  id: number;
  name: string;
  description: string;
  approvalDeadline: number;
}

export interface TutorPanelProjectMilestoneApi {
  id: number;
  status: TutorPanelMilestoneStatus | string;
  createdAt: string;
  updatedAt: string;
  pendingDeliveries: number;
  scheduleSettingsMilestone: TutorPanelScheduleSettingsMilestoneApi;
}

export interface TutorPanelProjectWithMilestonesApi {
  id: number;
  name: string;
  applicationType: string;
  scheduleSettings: TutorPanelScheduleSettingsApi;
  user: TutorPanelUserApi;
  members: TutorPanelProjectMemberApi[];
  milestones: TutorPanelProjectMilestoneApi[];
}

export class TutorPanelMilestoneApplicationProjectDto {
  id: number;
  name: string;
  applicationType: string;
  scheduleSettingsName?: string;

  constructor(data: any) {
    this.id = data?.id;
    this.name = data?.name;
    this.applicationType = data?.applicationType;
    this.scheduleSettingsName = data?.scheduleSettingsName;
  }

  static fromJson(data: any): TutorPanelMilestoneApplicationProjectDto {
    return new TutorPanelMilestoneApplicationProjectDto(data);
  }
}

export class TutorPanelScheduleSettingsMilestoneDto {
  id: number;
  name: string;
  description: string;
  approvalDeadline: number;

  constructor(data: any) {
    this.id = data?.id;
    this.name = data?.name;
    this.description = data?.description;
    this.approvalDeadline = data?.approvalDeadline;
  }

  static fromJson(data: any): TutorPanelScheduleSettingsMilestoneDto {
    return new TutorPanelScheduleSettingsMilestoneDto(data);
  }
}

export class TutorPanelMilestoneDto {
  id: number;
  status: TutorPanelMilestoneStatus | string;
  createdAt: string;
  updatedAt: string;
  applicationProject: TutorPanelMilestoneApplicationProjectDto | null;
  scheduleSettingsMilestone: TutorPanelScheduleSettingsMilestoneDto | null;
  pendingDeliveries: number;
  students: StudentInfo[];

  constructor(data: any) {
    this.id = data?.id;
    this.status = data?.status;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
    this.applicationProject = data?.applicationProject ? TutorPanelMilestoneApplicationProjectDto.fromJson(data.applicationProject) : null;
    this.scheduleSettingsMilestone = data?.scheduleSettingsMilestone ? TutorPanelScheduleSettingsMilestoneDto.fromJson(data.scheduleSettingsMilestone) : null;
    this.pendingDeliveries = data?.pendingDeliveries ?? 0;
    this.students = Array.isArray(data?.students) ? data.students : [];
  }

  static fromJson(data: any): TutorPanelMilestoneDto {
    return new TutorPanelMilestoneDto(data);
  }

  static fromProjectMilestone(project: TutorPanelProjectWithMilestonesApi, milestone: TutorPanelProjectMilestoneApi, students: StudentInfo[]): TutorPanelMilestoneDto {
    return new TutorPanelMilestoneDto({
      id: milestone.id,
      status: milestone.status,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
      pendingDeliveries: milestone.pendingDeliveries,
      applicationProject: {
        id: project.id,
        name: project.name,
        applicationType: project.applicationType,
        scheduleSettingsName: project.scheduleSettings?.name,
      },
      scheduleSettingsMilestone: milestone.scheduleSettingsMilestone,
      students,
    });
  }
}
