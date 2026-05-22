import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateSurchargeService {
    defaultCode: string;
    title: string;
    description: string;
    value: number;
    isPercent: boolean;
    linkedProductId?: number;
  
}

export class CreateOrUpdateSurchargeService extends CreateOrUpdateBaseService<ICreateOrUpdateSurchargeService> {
    url = `${services.collections}/surcharges`;
}    