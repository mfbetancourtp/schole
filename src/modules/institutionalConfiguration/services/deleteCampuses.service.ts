import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCampusesService {
  async run(campusId: number): Promise<void> {
    await axios.delete(`${services.structure}/campuses/${campusId}`);
  }
}
