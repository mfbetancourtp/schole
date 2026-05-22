import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteDepartmentsService {
  async run(departmentId: number): Promise<void> {
    await axios.delete(`${services.structure}/departments/${departmentId}`);
  }
}
