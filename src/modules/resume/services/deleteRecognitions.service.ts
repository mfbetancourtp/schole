import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteRecognitionsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/recognitions/${id}`);
  }
}
