import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateSectionTimeScaleRangeService {
  run(data: any): Promise<any> {
    return axios.post(`${services.structure}/section-time-scale-ranges`, data).then((response) => response.data);
  }
}
