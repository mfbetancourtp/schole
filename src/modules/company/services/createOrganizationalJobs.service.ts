import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface OrganizationalUnit {
  code: string | null;
  name: string | null;
  phoneNumber: number | null;
  mail: string | null;
  unitColor: string | null;
}

export interface OrganizationalJob {
  code: string | null;
  name: string | null;
  hierarchicalLevel: number | null;
}

interface ICreateOrganizationalJobsService {
  createOrganizationalUnit: boolean;
  organizationalUnit: OrganizationalUnit;
  organizationalJobs: OrganizationalJob[];
}

export class CreateOrganizationalJobsService extends CreateOrUpdateBaseService<ICreateOrganizationalJobsService> {
  url = `${services.organizational}/admin/organizational-jobs`;
}
