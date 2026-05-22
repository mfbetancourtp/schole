import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface CurriculumSubjectDto {
  createdAt: string;
  updatedAt: string;
  id: number;
  institutionId: number;
  curriculumDegreeId: number;
  subjectId: number;
  subjectCategoryId: number;
  percentArea: number;
  hourlyIntensity: number;
  orderQualificationsBulletinSubjects: number;
  orderQualificationsBulletinArea: number;
}

export interface SubjectDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  areaId: number;
  name: string;
  lmsTemplateCode: string;
  abbreviation: string;
  curriculumSubject: CurriculumSubjectDto;
}

export interface AreaDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  name: string;
  abbreviation?: any;
  subjects: SubjectDto[];
}

export interface Subject2Dto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  areaId: number;
  name: string;
  lmsTemplateCode: string;
  abbreviation: string;
  curriculumSubject: any;
}

export interface PendingSubjectDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  name: string;
  abbreviation: string;
  subjects: Subject2Dto[];
}

export interface CurriculumDegreeDto extends TimestampDto {
  id: number;
  institutionId: number;
  curriculumId: number;
  degreeId: number;
  maxSubjectFailed: number;
  ratingScaleId: any;
}

export interface CurriculumDto extends TimestampDto {
  id: number;
  institutionId: number;
  name: string;
  administrativeResolution: string;
  resolutionDate: string;
}

export interface SubjectCategoryDto extends TimestampDto {
  id: number;
  institutionId: number;
  abbreviation: string;
  name: string;
  includeInOfficialReports: number;
  autoAssignUponMatriculate: number;
}

export interface SubjectsCurriculumAndDegreeDto extends TimestampDto {
  areas: AreaDto[];
  pendingSubjects: PendingSubjectDto[];
  curriculumDegree: CurriculumDegreeDto;
  curriculum: CurriculumDto;
  subjectCategories: SubjectCategoryDto[];
}
