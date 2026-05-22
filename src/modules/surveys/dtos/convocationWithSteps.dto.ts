import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import type { DetailDto } from './convocationStep.dto';

export interface ConvocationStepType {
  id: number;
  name: string;
}

export interface StepDto {
  id: number;
  institutionId: number;
  title: string;
  convocationId: number;
  convocationStepTypeId: number;
  surveyId?: number;
  checklistId?: number | null;
  comments: any[];
  order: number;
  allowQuotes?: number;
  maxQuotes: number;
  minInitialQuoteValue: number;
  requiresApproval: number;
  convocationEnrolStepId: any;
  createdAt: string;
  updatedAt: string;
  ConvocationStepType: ConvocationStepType;
  isApproved?: any;
  statePayment: string;
  description: string;
  urlVideoConvocationStep: any;
  steps: any[];
  detail?: DetailDto | DetailDto[] | null;
}
export interface ConvocationStepsDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  title: string;
  description: string;
  thumbnail?: any;
  urlBanner?: any;
  startDate: string;
  endDate: string;
  levelId: number;
  degreeIds: string;
  active: number;
  defaultRoleId: number;
  steps: StepDto[];
  requiredOrder: number;
}
