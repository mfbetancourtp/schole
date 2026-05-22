import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CountryDto {
  id: number;
  code: string;
  name: string;
}

export interface RegionDto {
  id: number;
  countryId: number;
  code: string;
  name: string;
  country: CountryDto;
}

export interface MunicipalityDto {
  id: number;
  regionId: number;
  code: string;
  name: string;
  region: RegionDto;
}

export interface IdentificationTypeDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  abbreviation: string;
}

export interface GenderDto {
  id: number;
  name: string;
}

export interface PeopleDto extends TimestampDto {
  id: number;
  institutionId: number;
  userId: number;
  lmsUserKey: string;
  identification: string;
  identificationTypeId: number;
  identificationMunicipalityId: number;
  firstName: string;
  secondName: string;
  firstLastname: string;
  secondLastname: string;
  names: string;
  lastnames: string;
  mobile: string;
  homePhone: string;
  workPhone: string;
  email: string;
  homeMunicipalityId: number;
  direction: string;
  birthDate: string;
  birthMunicipalityId: number;
  nationality: string;
  genderId: number;
  religion: string;
  primaryLanguage: string;
  homeMunicipality: MunicipalityDto;
  birthMunicipality: MunicipalityDto;
  identificationType: IdentificationTypeDto;
  gender: GenderDto;
  createdAt: string;
  outputContactOne: string;
  outputContactTwo: string;
  observations: string;
  zone: string;
  scholarshipTypeId: number;
  schoolInsuranceId: number;
}

export interface StudentDto extends TimestampDto {
  id: number;
  institutionId: number;
  peopleId: number;
  people: PeopleDto;
  code: string;
  codeMEN: string;
  customFields: CustomFieldDto[];
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

export interface AcademicPeriodGroupDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodId: number;
  degreeId: number;
  journeyId: number;
  groupId: number;
  directorPeopleId: number;
  quota: number;
  academicPeriod: AcademicPeriodDto;
  courseName: string;
}

export interface EnrolledStudentDto extends TimestampDto {
  id: number;
  institutionId: number;
  academicPeriodGroupId: number;
  studentId: number;
  studentCategoryId: number;
  registeredDate: string;
  isRetired: number;
  reasonRetired: string;
  retiredDate: string;
  ignorePeriodIds: string;
  isApproved: number;
  isPreEnrolled: number;
  deleteAt?: any;
  student: StudentDto;
  academicPeriodGroup: AcademicPeriodGroupDto;
}

export interface SurveySectionDto {
  surveySectionId: number;
  surveyId: number;
  title: string;
  description?: string;
  fields: CustomFieldDto[];
}
export interface CustomFieldDto {
  questionId: number;
  typeDataId: number;
  typeData: string;
  field: string;
  isRequired: number;
  value: string | number | null;
  answerOptionId: number | null;
  answerOptions: AnswerOption[];
  type?: string;
}
export interface AnswerOption {
  id: number;
  text: string;
  value: string;
}
