import { services } from '../../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateProgramsService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/academic-programs/levels`;
}
