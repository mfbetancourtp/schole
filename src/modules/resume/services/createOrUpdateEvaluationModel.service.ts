import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface CreateOrUpdateEvaluationModelPayload {
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  teacherEvaluationScaleId: number | null;
}

export class CreateOrUpdateEvaluationModelService extends CreateOrUpdateBaseService<CreateOrUpdateEvaluationModelPayload> {
  url = `${services.structure}/evaluation-models`;
}
