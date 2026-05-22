import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAcademicBackgroundsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/academic-backgrounds/${id}`);
  }
}
