export interface MyApplicationApiItemDto {
  id: number;
  motivation?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  declarationAccepted?: number;
  scholarshipSettings?: {
    id: number;
    name?: string;
    code?: string;
    percentage?: number;
    benefitDuration?: number;
    typeScholarship?: { id: number; name?: string };
    academicPeriod?: { id: number; name?: string };
  };
  scholarshipStatus?: {
    id: number;
    code?: string;
    name?: string;
    color?: string;
  };
  documents?: Array<{
    id: number;
    fileUrl?: string;
    requiredDocumentId?: number;
    updatedAt?: string;
    status?: string;
    createdAt?: string;
    // shape from list endpoint
    scholarshipDocument?: { id: number; name?: string; code?: string };
    // shape from detail endpoint
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
  }>;
  progress?: {
    total: number;
    approved: number;
    pending: number;
    percentage: number;
  };
}

export interface ApplicationDetailResponseDto {
  people?: {
    id: number;
    names?: string;
    lastnames?: string;
    identification?: string;
    email?: string;
    mobile?: string;
    direction?: string;
  };
  data?: MyApplicationApiItemDto;
}

export interface MyApplicationsResponseDto {
  data: MyApplicationApiItemDto[];
}

export interface ApplicationDto {
  id: number;
  scholarshipName: string;
  submittedDate: string;
  status: 'borrador' | 'pendiente' | 'subsanacion' | 'evaluada' | 'adjudicada' | 'rechazada';
  currentStep: number;
  isNew?: boolean;
}
