import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

interface CategoryOrderItem {
  id: number;
  orden: number;
}

export class UpdateOrderChecklistCategoriesService {
  async run(items: CategoryOrderItem[]): Promise<void> {
    await axios.patch(`${services.forms}/categoria-pregunta-checklist/reorder`, items);
  }
}
