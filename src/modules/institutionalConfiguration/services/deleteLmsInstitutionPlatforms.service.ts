import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLmsInstitutionPlatformsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.lms}/admin/lms-institution-platforms/${id}`);
  }
}
