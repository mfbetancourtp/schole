import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDegreesForPricesPortfolioService {
  async run() {
    return axios.get(`${services.academic}/academic-programs/degrees`).then((response) => response.data);
  }
}
