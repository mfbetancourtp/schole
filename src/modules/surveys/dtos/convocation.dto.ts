import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { ConvocationStepDto, ConvocationStepForConfigureStepsDto } from './convocationStep.dto';
import { convocationEnrolDto } from './convocationEnrol.dto';

export interface ConvocationwithEnrolsDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  title: string;
  description: string;
  thumbnail: string;
  urlBanner: string;
  startDate: string;
  endDate: string;
  levelId: number;
  degreeIds: string;
  active: number;
  defaultRoleId: number;
  numberPrevious: number;
  numberNews: number;
  userNotification: number;
  countMatriculatesConvocation: number;
  countEarringConvocation: number;
  steps: ConvocationStepDto[];
  enrols: convocationEnrolDto[];
}

export interface ConvocationDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  title: string;
  description: string;
  thumbnail: string;
  urlBanner: string;
  startDate: string;
  endDate: string;
  levelName: string;
  levelId: number;
  degreeIds: string;
  active: number;
  defaultRoleId: number;
  userNotification: number;
  cantEnrolls: number;
}

export interface ConvocationWithStepsDto extends ConvocationDto {
  steps: ConvocationStepDto[];
}
export interface ConvocationWithStepForConfigureStepsDto extends ConvocationDto {
  steps: ConvocationStepForConfigureStepsDto[];
}
