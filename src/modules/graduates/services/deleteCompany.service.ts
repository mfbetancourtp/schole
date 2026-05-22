import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCompanyService {
  async run(id: number) {
    await axios.delete(`${services.graduates}/companies/${id}`);
  }
}
