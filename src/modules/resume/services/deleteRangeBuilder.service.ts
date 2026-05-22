import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteRangeBuilderService {
  async run(rangeBuilderId: number): Promise<void> {
    await axios.delete(`${services.structure}/range-builders/${rangeBuilderId}`);
  }
}
