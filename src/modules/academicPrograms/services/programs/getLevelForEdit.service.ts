import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { LevelPage3 } from '../../dtos/programs/levelsPage3.dto';

export class GetLevelForEditService {
  run(levelId: number) {
    return axios.get<LevelPage3[]>(`${services.academic}/academic-programs/levels/${levelId}`).then((response) => response.data);
  }
}
