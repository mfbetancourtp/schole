import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteFacultiesService {
  async run(facultyId: number): Promise<void> {
    await axios.delete(`${services.structure}/faculties/${facultyId}`);
  }
}
