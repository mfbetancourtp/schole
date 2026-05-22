import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AreaWithSubjectsDto } from '../dtos/academicLoad.dto';

export class GetAreasWithSubjectsService {
  run() {
    return axios.get<any>(`${services.structure}/areas`, { params: { noPag: true } }).then((response) => response.data);
  }
}
