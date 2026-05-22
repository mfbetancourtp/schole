import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetTypesFinancingByParentIdService {
  async run(typesFinancingId: number) {
    return axios.get(`${services.budget}/admin/type-financing-sources/financing-sources?typeFinancingSourceId=${typesFinancingId}`).then((response) => response.data);
  }
}
