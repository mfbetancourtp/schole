import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface IEmergencyEditLog {
  id: number | null;
  usuarioId: number;
  action: string;
  entityId: number;
  field: string;
  entity: string;
  valueBefore: string;
  valueAfter: string;
  reason: string;
}
export class CreateOrUpdateEmergencyEditLogService extends PostBaseService<IEmergencyEditLog | any> {
  url = `${services.curricularDesign}/logs/createOrUpdate`;
  isFormData = false;
}
