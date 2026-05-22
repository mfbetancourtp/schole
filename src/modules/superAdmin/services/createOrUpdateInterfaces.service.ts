import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateInterfacesService extends CreateOrUpdateBaseService<any> {
  url = `${services.admin}/configure-interfaces/interfaces`;
  isFormData = true;
}