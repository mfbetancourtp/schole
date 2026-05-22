import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteDiscountService {
  async run(discountId: number) {
    await axios.delete(`${services.casurid}/admin-discounts/${discountId}`);
  }
}
