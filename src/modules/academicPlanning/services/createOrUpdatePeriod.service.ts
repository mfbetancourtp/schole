import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdatePeriodService {
    name: string;
    endDate: string;
    active: any;
    percent: number;
    startDate: string;
    abbreviation: string;
    academicPeriodId: number;
}

export class CreateOrUpdatePeriodService extends CreateOrUpdateBaseService<ICreateOrUpdatePeriodService> {
    url = `${services.academic}/academic-planning/periods`;
}