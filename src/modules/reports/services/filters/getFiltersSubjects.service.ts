import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';


export class GetFiltersSubjectsService {
  async run() {
    return axios.get<any>(`${services.academic}/academic-programs/all-subjects`).then((response) => response.data);
  }
}
