import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDiscountsPortfolioService {
  async run() {
    return axios.get(`${services.casurid}/admin-discounts-portfolio`).then((response) => response.data);
  }
}
