import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLevelOffensesService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.classroom}/disciplinary-control/level-offenses/${id}`);
  }
}
