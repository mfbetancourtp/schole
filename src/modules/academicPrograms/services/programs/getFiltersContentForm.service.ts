import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetFiltersContentForm {
  run() {
    return axios.get<any>(`${services.academic}/academic-programs/levels-related-data`).then((response) => {
      return response.data;
    });
  }
}
