import { DegreeDto } from './degree.dto';
import { TimestampDto } from './timestamp.dto';

export interface LevelDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail?: any;
  name: string;
  abbreviation?: string;
  levelTypeId?: number;
  facultyId?: number;
  maxQuality?: number;
  approvedQuality?: number;
  minQualityForRetrieval?: number;
  retrievalQuality?: number;
  degrees: DegreeDto[];
}

export interface LevelDetail extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: any;
  name: string;
  abbreviation: string;
  levelTypeId: any;
  maxQuality: any;
  approvedQuality: any;
  minQualityForRetrieval: any;
  retrievalQuality: any;
  useCompetencies: number;
  percentageCompetencies: number;
  useCompetenciesInReports: number;
  useLearningOutcomes: number;
  percentageLearningOutcomes: number;
  showLearningOutcomesInReports: number;
  useTopics: number;
  useActivityCategories: number;
  percentageActivityCategories: number;
  showActivityCategoriesInReports: number;
}
