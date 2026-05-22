import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteTaskByIdService {
  async run(taskId: number): Promise<void> {
    await axios.delete(`${services.configurations}/institutional-task/${taskId}`);
  }
}
