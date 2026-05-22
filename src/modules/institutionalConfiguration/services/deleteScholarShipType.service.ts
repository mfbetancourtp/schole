import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteScholarShipTypeService {
  async run(ScholarShipTypeId: number): Promise<void> {
    await axios.delete(`${services.users}/people/deleteScholarship/${ScholarShipTypeId}`);
  }
}
