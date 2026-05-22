import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteCompanyArea {
  async run(CompanyAreaId: number): Promise<void> {
    await axios.delete(`${services.users}/people/companyArea/${CompanyAreaId}`);
  }
}
