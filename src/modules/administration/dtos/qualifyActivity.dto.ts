import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface DeliveryDto {
  id: number;
  activityId: string;
  quality: number;
  feedback: string | any;
  qualificationConvert: QualificationConvertDto;
}

export interface QualificationConvertDto {
  qualitativeQualification: string;
  qualitativeQualificationAbbreviation: string;
  quantitativeQualification: number;
  ratingScaleDetailId: number;
}

export interface StudentDto {
  name: string;
  userId: number;
  matriculateId: number;
  matriculateSubjectId: number;
  delivery: DeliveryDto;
  medalsIds: number[];
}

export interface MedalDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  urlImage: string;
  description: string;
}

export interface QualifyActivityDto {
  id: number;
  name: string;
  category: string;
  periodId: number;
  courseName: string;
  degreeName: string;
  groupAbbreviation: string;
  academicPeriodGroupId: number;
  curriculumSubjectId: number;
  students: StudentDto[];
  medals: MedalDto[];
  scales: any;
}
