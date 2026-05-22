import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTeacherContractService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.academic}/planning/teacher-contracts/${id}`);
  }
}
