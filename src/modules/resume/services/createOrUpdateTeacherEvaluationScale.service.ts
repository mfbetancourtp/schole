import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface CreateOrUpdateTeacherEvaluationScalePayload {
  isActive: boolean;
  name: string;
  description: string;
  minimumOverallScore: number;
  maximumOverallScore: number;
  tieStanding: boolean;
}

export class CreateOrUpdateTeacherEvaluationScaleService extends CreateOrUpdateBaseService<CreateOrUpdateTeacherEvaluationScalePayload> {
  url = `${services.structure}/teacher-evaluation-scales`;
}
