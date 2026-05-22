export interface ConvocationEnrollPeopleDto {
  id: number;
  identification: string;
  names: string;
  lastnames: string;
  email: string;
  user: {
    id: number;
    avatar: string | null;
  };
}

export interface ConvocationEnrollConvocationDto {
  id: number;
  institutionId?: number;
  title: string;
}

export interface ConvocationEnrollOfferingDto {
  id: number;
  program: {
    id: number;
    name: string;
  };
}

export interface ConvocationEnrollDto {
  id: number;
  institutionId?: number;
  admissionExamScore?: number | null;
  status: string;
  statusLabel: string;
  progress: number;
  createdAt: string;
  updatedAt: string | null;
  people: ConvocationEnrollPeopleDto;
  convocation: ConvocationEnrollConvocationDto;
  offering: ConvocationEnrollOfferingDto | null;
}

export interface ConvocationEnrollPaginationDto {
  data: ConvocationEnrollDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ConvocationEnrollStatsDto {
  total: number;
  inProcess: number;
  admitted: number;
  newStudents: number;
}

export interface ConvocationEnrollStatusOptionDto {
  label: string;
  key: string;
}

export interface ConvocationEnrollStatsResponseDto {
  stats: ConvocationEnrollStatsDto;
  statusOptions: ConvocationEnrollStatusOptionDto[];
}

export interface ConvocationEnrollDetailPeopleDto {
  id: number;
  identification: string | null;
  firstName: string | null;
  secondName: string | null;
  firstLastname: string | null;
  secondLastname: string | null;
  names: string | null;
  lastnames: string | null;
  mobile: string | null;
  homePhone: string | null;
  workPhone: string | null;
  email: string | null;
  direction: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConvocationEnrollDetailProgramDto {
  id: number;
  name: string;
  code: string | null;
  programTitle: string | null;
}

export interface ConvocationEnrollDetailOfferingDto {
  id: number;
  program: ConvocationEnrollDetailProgramDto | null;
}

export interface ConvocationEnrollProgressInfoDto {
  completedSteps: number;
  totalSteps: number;
  remainingSteps: number;
  currentProgress: number;
}

export interface ConvocationEnrollTimelineItemDto {
  id: number;
  title: string;
  date: string | null;
}

export interface ConvocationEnrollDetailDto {
  id: number;
  institutionId: number;
  convocationId: number;
  peopleId: number;
  code: string;
  degreeId: number | null;
  matriculateId: number | null;
  stateMatriculate: string | null;
  isPrevius: number | null;
  offeringId: number | null;
  curriculumPeriodId: number | null;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string | null;
  people: ConvocationEnrollDetailPeopleDto;
  offering: ConvocationEnrollDetailOfferingDto | null;
  statusLabel: string;
  progressInfo: ConvocationEnrollProgressInfoDto | null;
  timeline: ConvocationEnrollTimelineItemDto[];
}

export interface ConvocationEnrollDetailResponseDto {
  statusCode: number;
  data: ConvocationEnrollDetailDto;
}

export interface ConvocationEnrollProgressDetailStepTypeDto {
  id: number;
  name: string;
}

export interface ConvocationEnrollProgressDetailEnrolStepDto {
  id: number;
  institutionId: number;
  convocationEnrolId: number;
  convocationStepId: number;
  rowId: number | null;
  isApproved: number | null;
  rejectedObservations: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ConvocationEnrollProgressDetailItemDetailDto {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  survey?: {
    id: number;
    title: string;
    description: string | null;
  } | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  puntajeTotal?: number | null;
  puntajeObtenido?: number | null;
  porcentajePuntaje?: number | null;
  estado?: string | null;
  checklist?: {
    id: number;
    titulo: string;
    duracion: string | null;
  } | null;
}

export interface ConvocationEnrollProgressDetailDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId: number | null;
  order: number;
  description: string | null;
  urlVideoConvocationStep: string | null;
  paymentMethodId: number | null;
  checklistId: number | null;
  createdAt: string;
  updatedAt: string | null;
  stepType: ConvocationEnrollProgressDetailStepTypeDto;
  enrolStep: ConvocationEnrollProgressDetailEnrolStepDto | null;
  details: ConvocationEnrollProgressDetailItemDetailDto[];
}

export interface ConvocationEnrollProgressDetailsResponseDto {
  statusCode: number;
  data: ConvocationEnrollProgressDetailDto[];
}
