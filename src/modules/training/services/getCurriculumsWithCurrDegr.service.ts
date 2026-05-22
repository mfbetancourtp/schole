import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCurriculumsWithCurrDegrService {
  async run() {
    return axios.get<any>(`${services.academic}/academic-programs/curriculums-with-curriculum-degrees`).then((response) => response.data);
  }
}
