import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface DegreeDto {
  name: string;
  abbreviation: string;
}

export interface GroupDto {
  name: string;
  abbreviation: string;
}

export interface LevelDto {
  useCompetencies: number;
  percentageCompetencies: number;
  useLearningOutcomes: number;
  percentageLearningOutcomes: number;
  useTopics: number;
  useActivityCategories: number;
  percentageActivityCategories: number;
}

export interface SubjectDto {
  name: string;
}

export interface TeacherDto {
  names: string;
  lastnames: string;
  avatar: string;
}

export interface CourseDto extends TimestampDto {
  id: number;
  institutionId: number;
  ownerUserId: number;
  subjectAssignmentId: number;
  code: string;
  name: string;
  description?: any;
  degreeId?: any;
  isTooCourseLMS: number;
  lmsCourseId?: number;
  independentGroupId?: any;
  curriculumProductId?: any;
  academicPeriodGroupId: number;
  percentageLearningOutcomes: string;
  percentageTopics: string;
  subject: SubjectDto;
  teacher: TeacherDto;
  syncOnlyFinalQuality: any;
  createdScheduleCourses?: any;
  lmsInstitutionPlatformId?: any;
  urlLms?: any;
}

export interface HomeTeacherCoursesDto {
  id: number;
  degree: DegreeDto;
  group: GroupDto;
  level: LevelDto;
  courses: CourseDto[];
}
