import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class UpdateLevelService {
  run(dataSend: any, levelId: number) {
    return axios.put(`${services.academic}/academic-programs/levels/${levelId}`, dataSend).then((response) => response.data);
  }
}
