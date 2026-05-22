import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateCollectionStepService {
    name: string;
    startNumberDay: number;
    endNumberDay: number;
    lockCompletion: string;
    active: number;
    surchargeIds: number[];
}

export class CreateOrUpdateCollectionStepService extends CreateOrUpdateBaseService<ICreateOrUpdateCollectionStepService> {
    url = `${services.collections}/collection-steps`;
}    