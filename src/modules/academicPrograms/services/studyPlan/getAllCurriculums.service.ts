import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { CurriculumsDto } from '../../dtos/studyPlan/Curriculums.dto';

export class GetAllCurriculumsService {
  run() {
    return axios.get<CurriculumsDto[]>(`${services.academic}/academic-programs/curriculums`).then((response) => response.data);
  }
}
