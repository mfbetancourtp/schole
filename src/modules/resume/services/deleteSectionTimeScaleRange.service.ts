import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSectionTimeScaleRangeService {
  async run(sectionTimeScaleRangeId: number): Promise<void> {
    await axios.delete(`${services.structure}/section-time-scale-ranges/${sectionTimeScaleRangeId}`);
  }
}
