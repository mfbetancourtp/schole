import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllSemestersService {
  async run(params: any) {
    return axios.get(`${services.curricularDesign}/semesters/getAll`, { params }).then((response) => response.data);
  }
}
