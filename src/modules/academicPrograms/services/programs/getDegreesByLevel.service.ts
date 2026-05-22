import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { DegreeDto } from '../../dtos/programs/degree.dto';

export class GetDegreesByLevelService {
  run(levelId: number) {
    return axios.get<DegreeDto[]>(`${services.academic}/academic-programs/degrees?levelId=${levelId}`).then((response) => response.data);
  }
}
