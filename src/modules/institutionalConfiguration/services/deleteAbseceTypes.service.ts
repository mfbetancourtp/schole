import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAbseceTypesService {
  async run(abseceTypesId: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-implementation/absence-type/${abseceTypesId}`);
  }
}
