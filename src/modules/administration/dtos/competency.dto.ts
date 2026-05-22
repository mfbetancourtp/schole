import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface DetailedCompetenceDto extends TimestampDto {
  id: number;
  institutionId: number;
  competencyLevelName: string;
  competencyLevelId: number;
  competencyTypeName: string;
  competencyTypeId: number;
  code: string;
  description: string;
  curriculumSubjectId: number;
  degreeId: number;
  percentage: any;
  planningWeekId: number;
  periodName: string;
  periodId: number;
  courseId: number;
  cant_topics: number;
  cant_LearningOutcomes: number;
  standard: string;
  dba: string;
  evidence: string;
  purposes: string;
  components: string;
  learning: string;
  learningOutcomes: any;
}

// Form
export interface CompetencyDto extends TimestampDto {
  id: number;
  institutionId: number;
  competencyLevelId: number;
  competencyTypeId: number;
  code: string;
  description: string;
  curriculumSubjectId: number;
  degreeId: number;
  percentage: any;
  planningWeekId: number;
  periodId: number;
  courseId: number;
}

export interface LearningOutcomeDto extends TimestampDto {
  id: number;
  institutionId: number;
  competencyId: number;
  code: string;
  description: string;
  curriculumId: number;
  degreeId: number;
  percentage: string;
}

export interface TopicDto extends TimestampDto {
  id: number;
  institutionId: number;
  code: string;
  courseId: number;
  competencyId: number;
  name: string;
  description: string;
  rowOrder: any;
}

export interface CompetencyWithLearningOutcomeAndTopicDto {
  competency: CompetencyDto;
  LearningOutcomes: LearningOutcomeDto[];
  topics: TopicDto[];
}
