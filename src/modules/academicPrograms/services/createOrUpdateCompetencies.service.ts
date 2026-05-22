import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateOrUpdateCompetencyLearningOutcomePayload {
  id?: number | null;
  name: string | null;
  code: string | null;
  competencyId?: number | null;
}

export interface CreateOrUpdateCompetencyPayload {
  id?: number | null;
  name: string | null;
  code: string | null;
  competencyTypeId: number | null;
  subjectId?: number | null;
  learningOutcomes: CreateOrUpdateCompetencyLearningOutcomePayload[];
}

export interface CreateOrUpdateCompetenciesPayload {
  name: string | null;
  code: string | null;
  description: string | null;
  shortName: string | null;
  areaId: number | null;
  credits: number;
  theoricalHours: number;
  practicalHours: number;
  maximumHours: number | null;
  subjectCategoryId: string | number | null;
  spaceTypeId: string | number | null;
  isDegreeRequirement: number;
  programIds: number[];
  allPrograms: number;
  competencies: CreateOrUpdateCompetencyPayload[];
}

export class CreateOrUpdateCompetenciesService extends CreateOrUpdateBaseService<CreateOrUpdateCompetenciesPayload> {
  url = `${services.academic}/competencies`;
  isFormData = false;
}
