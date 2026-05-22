import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCurriculumOfferingService {
  async run(curriculumOfferingId: number): Promise<void> {
    await axios.delete(`${services.academic}/planning/curriculum-offerings/${curriculumOfferingId}`);
  }
}
