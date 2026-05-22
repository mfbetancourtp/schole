import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSupplementaryTrainingsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/supplementary-trainings/${id}`);
  }
}
