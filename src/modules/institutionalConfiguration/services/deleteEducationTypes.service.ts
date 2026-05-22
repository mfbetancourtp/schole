import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEducationTypesService {
  async run(educationTypesId: number): Promise<void> {
    await axios.delete(`${services.structure}/education-types/${educationTypesId}`);
  }
}
