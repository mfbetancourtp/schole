import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEducationCategoryService {
  async run(educationCategoryId: string | number): Promise<void> {
    await axios.delete(`${services.structure}/education-categories/${educationCategoryId}`);
  }
}
