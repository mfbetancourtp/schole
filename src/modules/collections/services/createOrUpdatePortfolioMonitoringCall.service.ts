import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdatePortfolioMonitoringCallService {
    receiverUserId: number;
    observations: string;
    dateNextContact: any;
}

export class CreateOrUpdatePortfolioMonitoringCallService extends CreateOrUpdateBaseService<ICreateOrUpdatePortfolioMonitoringCallService> {
    url = `${services.collections}/record-collections-calls`;
}    