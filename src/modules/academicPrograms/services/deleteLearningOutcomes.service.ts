import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLearningOutcomesService {
  async run(learningOutcomesId: number): Promise<void> {
    await axios.delete(`${services.academic}/learning-outcomes/${learningOutcomesId}`);
  }
}
