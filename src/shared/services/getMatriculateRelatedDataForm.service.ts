import axios from '../utils/axios';
import { services } from '../constant/services';

export class GetMatriculateRelatedDataFormService {
  run() {
    return axios.get(`${services.academic}/academic-administration/matriculates-related-data-form`).then((response) => response.data);
  }
}
