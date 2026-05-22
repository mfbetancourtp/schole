export interface ScheduleSettingMilestoneDto {
  id: number;
  scheduleSettingsId?: number;
  name: string;
  description: string;
  approvalDeadline: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleSettingDto {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  milestones?: ScheduleSettingMilestoneDto[];
  totalMilestones: number;
  maxApprovalDeadline: number;
}

export interface ScheduleSettingsPaginationDto {
  data: ScheduleSettingDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CreateScheduleSettingDto {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CreateScheduleSettingMilestoneDto {
  scheduleSettingsId: number;
  name: string;
  description: string;
  approvalDeadline: number;
}

export interface UpdateScheduleSettingMilestoneDto {
  name: string;
  description: string;
  approvalDeadline: number;
}

export interface MilestoneFormItem {
  id: number;
  name: string;
  description: string;
  approvalDeadline: number;
}
