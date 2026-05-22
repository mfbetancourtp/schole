import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteProgramCurriculumsService {
  async run(programCurriculumId: number): Promise<void> {
    await axios.delete(`${services.structure}/program-curriculums/${programCurriculumId}`);
  }
}
