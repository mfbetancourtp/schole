import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteProductionTypesService {
  async run(productionTypeId: number): Promise<void> {
    await axios.delete(`${services.structure}/production-types/${productionTypeId}`);
  }
}
