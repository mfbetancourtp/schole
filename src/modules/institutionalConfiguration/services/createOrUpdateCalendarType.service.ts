import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateCalendarTypeService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateCalendarTypeService extends CreateOrUpdateBaseService<ICreateOrUpdateCalendarTypeService> {
    url = `${services.academic}/institutional-configuration/calendar-types`;
    isFormData = false;
}