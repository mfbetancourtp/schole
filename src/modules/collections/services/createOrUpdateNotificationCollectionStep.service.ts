import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateNotificationCollectionStepService {
    collectionStepId: number | null;
    title: string;
    message: string;
    numberDay: number;
    channel: string | null;
    configReceiver: string | null;
}

export class CreateOrUpdateNotificationCollectionStepService extends CreateOrUpdateBaseService<ICreateOrUpdateNotificationCollectionStepService> {
    url = `${services.collections}/collection-step-notifications`;
}    