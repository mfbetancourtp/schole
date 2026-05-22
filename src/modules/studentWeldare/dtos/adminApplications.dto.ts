export interface AdminApplicationListItemDto {
  id: number;
  motivation?: string;
  createdAt?: string;
  people?: {
    id: number;
    names?: string;
    lastnames?: string;
    identification?: string;
    email?: string;
    mobile?: string;
    studentCode?: string;
  };
  scholarshipSettings?: {
    id: number;
    name?: string;
    code?: string;
    percentage?: number;
    typeScholarship?: { id: number; name?: string };
  };
  scholarshipStatus?: {
    id: number;
    code?: string;
    name?: string;
    color?: string;
  };
  progress?: {
    total: number;
    approved: number;
    pending: number;
    percentage: number;
  };
}

export interface AdminApplicationDocumentDto {
  id: number;
  fileUrl?: string;
  requiredDocumentId?: number;
  updatedAt?: string;
  requiredDocument?: {
    id: number;
    scholarshipDocument?: {
      id: number;
      code?: string;
      name?: string;
      abjuntoType?: string;
    };
  };
  review?: { id: number; status?: string; comment?: string } | null;
}

export interface AdminApplicationDetailDto extends AdminApplicationListItemDto {
  declarationAccepted?: number;
  documents?: AdminApplicationDocumentDto[];
}

export interface ApplicationLogEntryDto {
  id: number;
  action?: string;
  description?: string;
  createdAt?: string;
  user?: { id: number; name?: string; names?: string; lastnames?: string };
  scholarshipStatus?: { id: number; name?: string; color?: string };
}

export interface DisplayApplicationDto {
  id: number;
  displayId: string;
  studentName: string;
  studentCode: string;
  scholarshipName: string;
  scholarshipSettingsId: number;
  statusId: number;
  date: string;
  statusKey: string;
  statusCode: string;
  statusName: string;
  statusColor: string;
}

export interface ScholarshipApplicationsStatsItemDto {
  name?: string;
  status?: string;
  code?: string;
  count?: number;
  color?: string;
}
