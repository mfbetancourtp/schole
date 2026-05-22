import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface CreateOrUpdateEvaluationCriteriaPayload {
  evaluationModelId: number;
  profileSectionsId: number;
  calculationType: 'PER_RECORD' | 'TIME_SCALE';
  educationTypeId?: number | null;
  productionTypeId?: number | null;
  validation: number;
  status: boolean;
}

export class CreateOrUpdateEvaluationCriteriaService extends CreateOrUpdateBaseService<CreateOrUpdateEvaluationCriteriaPayload> {
  url = `${services.structure}/evaluation-criteria`;
}
