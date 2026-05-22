import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class CreateDegreesService {
  run(degrees: any, levelId: number) {
    return axios.post(`${services.academic}/academic-programs/degrees-batch/${levelId}`, degrees).then((response) => response.data);
  }
}
