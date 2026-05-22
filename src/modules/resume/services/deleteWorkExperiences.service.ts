import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteWorkExperiencesService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/workExperiences/${id}`);
  }
}
