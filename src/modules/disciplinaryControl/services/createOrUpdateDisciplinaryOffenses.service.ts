import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateDisciplinaryOffensesService extends CreateOrUpdateBaseService<any> {
    url = `${services.classroom}/disciplinary-control/disciplinary-offenses`;
}