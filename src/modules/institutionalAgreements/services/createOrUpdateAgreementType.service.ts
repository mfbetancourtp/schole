import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateOrUpdateAgreementTypeDto {
  code: string;
  name: string;
  description: string;
  isActive: 0 | 1;
}

export class CreateOrUpdateAgreementTypeService extends CreateOrUpdateBaseService<CreateOrUpdateAgreementTypeDto> {
  url = `${services.structure}/agreements-types`;
}
