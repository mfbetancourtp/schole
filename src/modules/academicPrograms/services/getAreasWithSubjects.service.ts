import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAreasWithSubjectsService {
  run(params?: any) {
    return axios.get<any>(`${services.structure}/areas`, { params }).then((response) => response.data);
  }
}
