import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface CreateOrUpdateRangeBuilderPayload {
  teacherEvaluationScaleId: number;
  from: number;
  to: number;
  classificationName: string;
  color: string;
  hierarchyLevel: number;
}

export class CreateOrUpdateRangeBuilderService extends CreateOrUpdateBaseService<CreateOrUpdateRangeBuilderPayload> {
  url = `${services.structure}/range-builders`;
}
