import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface OrganizationalInitDto extends TimestampDto {
  id: number;
  institutionId: number;
  campusId: number;
  code: string;
  name: string;
  phoneNumber: string;
  mail: string;
  hierarchicalLevel?: any;
  hierarchicalKey?: any;
  unitColor: string;
}

export interface AcademicPeriodDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  curriculumId: number;
  calendarTypeId: number;
  startDate: string;
  endDate: string;
  active: number;
}

export interface SurveyDto extends TimestampDto {
  id: number;
  institutionId: number;
  applicationId: number;
  title: string;
  description: string;
  urlImgHeader: string;
  startDate: string;
  endDate: string;
  active: number;
  order?: any;
  weight?: any;
}

export interface EmployeeDto {
  employeeId: number;
  nameEmployee: string;
  checked: number;
}

export interface EvaluationConfigurationDto extends TimestampDto {
  id: number;
  academicPeriodId: number;
  unitOrganizationalId: number;
  surveyId: number;
  startDate: string;
  endDate: string;
  active: number;
  numberSeniorPosition: number;
  numberSamePosition: number;
  numberLowerPosition: number;
  numberExternalEvaluators: number;
  percentSeniorPosition: number;
  percentSamePosition: number;
  percentLowerPosition: number;
  percentExternalEvaluators: number;
  OrganizationalUnitName: string;
  numberScheduled: number;
  numberDeveloped: number;
  numberEvaluated: number;
  evaluatorsDefined: number;
}

// SpecifyEvaluators
export interface EvaluatorDto {
  id?: any;
  employeeEvaluatedId: number;
  employeeEvaluatorId?: any;
  hierarchyPosition: string;
}

export interface CorporateEvaluationPeriodEmployeeDto extends TimestampDto {
  id: number;
  corporateEvaluationPeriodId: number;
  employeeId: number;
  averagePoints?: any;
  nameEmployee: string;
  evaluatorsSenior: EvaluatorDto[];
  evaluatorsSamer: EvaluatorDto[];
  evaluatorsLower: EvaluatorDto[];
  evaluatorsExternal: EvaluatorDto[];
}
