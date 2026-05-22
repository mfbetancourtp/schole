import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

// import { DetailedCompetenceDto } from '../dtos/competency.dto';

export class GetListCompetencesService {
  run(courseId: any, periodId: any) {
    // return axios.get<DetailedCompetenceDto[]>(`${services.classroom}/classroom-administration/course/${courseId}/competencies`).then((response) => response.data);
    return axios
      .get<{ data: any }>(`${services.classroom}/classroom-administration/competencies/curriculum_subjects/${courseId}?periodId=${periodId ?? ''}`)
      .then((response) => response.data);
  }
}
