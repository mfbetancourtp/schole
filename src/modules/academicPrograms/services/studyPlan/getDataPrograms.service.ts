import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { Level } from '../../dtos/programs/level.dto';

export class GetDataProgramsService {
  run() {
    return axios.get<Level[]>(`${services.academic}/academic-programs/levels/`).then((response) => response.data);
  }
}
