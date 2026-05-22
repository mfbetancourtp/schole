import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTeachingExperiencesService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/teaching-experiences/${id}`);
  }
}
