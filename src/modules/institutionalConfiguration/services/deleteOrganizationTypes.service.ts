import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteOrganizationTypesService {
  async run(organizationTypesId: number): Promise<void> {
    await axios.delete(`${services.structure}/organization-types/${organizationTypesId}`);
  }
}
