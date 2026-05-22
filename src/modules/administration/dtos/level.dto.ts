import { TimestampDto } from '../../../shared/dto/timestamp.dto';

export interface LevelDto extends TimestampDto {
  id: number;
  institutionId: number;
  thumbnail: string;
  name: string;
  abbreviation: string;
  levelTypeId?: any;
  facultyId?: any;
  maxQuality?: any;
  approvedQuality?: any;
  minQualityForRetrieval?: any;
  retrievalQuality?: any;
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
  code?: any;
  codeSnies?: any;
  titleGiven?: any;
  modality?: any;
  usePercentLearningOutcomesWithActivityCategories?: any;
}
