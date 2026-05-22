import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateSectionScoreRecordService {
  run(data: any): Promise<any> {
    return axios.post(`${services.structure}/section-score-records`, data).then((response) => response.data);
  }
}
