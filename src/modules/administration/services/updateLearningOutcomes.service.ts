import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdateLearningOutcomesService {
  async run(data: any): Promise<void> {
    await axios.post(`${services.classroom}/classroom-administration/learning-outcomes-scores-from-array`, data);
  }
}
