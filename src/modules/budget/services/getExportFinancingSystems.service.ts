import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetExportFinancigSystemsService {
  async run(params: any) {
    return axios
      .get<any>(`${services.budget}/admin/template-financing-sources-export`, {
        params,
      })
      .then((response) => response.data);
  }
}
