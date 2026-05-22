import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateContractTypeRule {
  name: string;
  code: string;
  minHours: number;
  maxHours: number;
  description: string;
  isActive: boolean;
  type: string;
}

export class CreateOrUpdateContractTypeRuleService extends CreateOrUpdateBaseService<ICreateOrUpdateContractTypeRule> {
  url = `${services.graduates}/contract-types`;
}
