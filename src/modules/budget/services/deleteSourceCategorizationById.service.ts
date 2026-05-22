import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSourceCategorizationByIdService {
  async run(categorizationId: number) {
    return axios.delete<any>(`${services.budget}/admin/source-categorization/${categorizationId}`).then((response) => response.data);
  }
}
