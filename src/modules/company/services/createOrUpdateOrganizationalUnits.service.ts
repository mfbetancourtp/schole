import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateOrganizationalUnitsService {
  code: string;
  name: string;
  phoneNumber: string | null;
  mail: string;
  unitColor: string;
}

export class CreateOrUpdateOrganizationalUnitsService extends CreateOrUpdateBaseService<ICreateOrUpdateOrganizationalUnitsService> {
  url = `${services.organizational}/admin/organizational-units`;
}
