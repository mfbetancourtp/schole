import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { Level } from '../../dtos/programs/level.dto';

export class GetAllDataProgramsService {
  run(levelId: number) {
    return axios.get<Level[]>(`${services.academic}/academic-programs/levels/${levelId}`).then((response) => response.data);
  }
}
