export interface RequestDocumentStatsDto {
  id: number;
  status: string;
  total: number;
  thisMonth: number;
}

export interface RequestDocumentListItemDto {
  id: number;
  userId: number;
  academicPeriodsId: number;
  description: string;
  requestStatusId: number;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  applicationType: { id: number; name: string };
  requestStatus: { id: number; name: string };
  attachments: { id: number; fileUrl: string }[];
}

export interface RequestDocumentDetailDto {
  id: number;
  applicationTypesId: number;
  userId: number;
  academicPeriodsId: number;
  description: string;
  requestStatusId: number;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  applicationType: { id: number; name: string };
  requestStatus: { id: number; name: string };
  applicant: {
    names: string;
    lastnames: string;
    email: string;
    code: string | null;
  };
  attachments: {
    id: number;
    fileUrl: string;
    applicationDocumentRequired: { id: number; code: string; name: string };
  }[];
  history: {
    id: number;
    userId: number;
    description: string;
    createdAt: string;
    requestStatus: { id: number; name: string } | null;
  }[];
}

export interface RequestStatusDto {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isFinalStatus: string | null;
}

export interface UpdateRequestStatusDto {
  requestStatusId?: number;
  message?: string;
}
