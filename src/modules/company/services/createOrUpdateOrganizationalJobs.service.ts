import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface IOrganizationalJob {
  code: string;
  name: string;
  hierarchicalLevel: number | null;
  organizationalUnitId: number | null;
  parentOrganizationalJobId: number | null;
}

export class CreateOrUpdateOrganizationalJobsService extends CreateOrUpdateBaseService<IOrganizationalJob> {
  url = `${services.organizational}/admin/organizational-jobs`;
}
