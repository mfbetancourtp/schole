import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePlayTimesService {
  async run(playTimeId: number): Promise<void> {
    await axios.delete(`${services.academic}/institutional-configuration/play-times/${playTimeId}`);
  }
}
