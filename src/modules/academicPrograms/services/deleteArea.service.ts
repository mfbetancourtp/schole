import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAreaService {
  async run(areaId: number) {
    await axios.delete(`${services.structure}/areas/${areaId}`);
  }
}
