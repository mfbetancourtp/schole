import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class RelatedDataSignaturesService {
  async run(itemId: any): Promise<any> {
    return axios.get(`${services.reports}/digital-signature/all/${itemId}`).then((response) => response.data);
  }
}
