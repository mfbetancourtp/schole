import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLearOutcActiCateService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-administration/learning-outcomes-activity-categories/${id}`);
  }
}
