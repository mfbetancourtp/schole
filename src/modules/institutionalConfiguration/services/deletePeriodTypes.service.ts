import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePeriodTypesService {
  async run(periodTypesId: number): Promise<void> {
    await axios.delete(`${services.structure}/period-types/${periodTypesId}`);
  }
}
