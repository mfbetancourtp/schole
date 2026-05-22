import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteProgramsService {
  async run(programsId: number): Promise<void> {
    await axios.delete(`${services.structure}/programs/${programsId}`);
  }
}
