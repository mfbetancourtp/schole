import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetConceptsPortfolioService {
  async run() {
    return axios.get(`${services.casurid}/admin-concepts-portfolio`).then((response) => response.data);
  }
}
