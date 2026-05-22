import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteModuleService {
  async run(moduleId: number): Promise<void> {
    await axios.delete(`${services.v2}/menu/modules/${moduleId}`);
  }
}
