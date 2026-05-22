import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface Idata {
  convocationId: number | any;
  matriculateId: number;
}

export class PostEnrolMatriculateService {
  run(data: Idata) {
    return axios.post(`${services.academic}/academic-planning/enrol-matriculate`, data).then((response) => response.data);
  }
}
