import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMenuItemService {
  async run(itemId: number): Promise<void> {
    await axios.delete(`${services.v2}/menu/items/${itemId}`);
  }
}
