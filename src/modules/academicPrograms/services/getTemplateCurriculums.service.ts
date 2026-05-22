import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTemplateCurriculumsService {
  run() {
    return axios.get(`${services.academic}/academic-programs/curriculums-import-template`).then((response) => response.data);
  }
}
