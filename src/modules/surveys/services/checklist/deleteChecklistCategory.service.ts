import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DeleteChecklistCategoryService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.forms}/categoria-pregunta-checklist/${id}`);
  }
}
