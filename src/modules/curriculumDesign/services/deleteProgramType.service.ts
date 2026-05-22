import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteProgramTypeService {
  async run(programTypeId: number): Promise<void> {
    await axios.delete(`${services.structure}/program-types/${programTypeId}`);
  }
}
