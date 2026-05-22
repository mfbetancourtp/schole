import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { SurveyDto } from '../dtos/configureEvaluations.dto';

export class GetSurveysService {
  run() {
    // return axios.get<SurveyDto[]>(`${services.surveys}/admin/surveys?key=evaluations`).then((response) => response.data);
    return axios.get<SurveyDto[]>(`${services.surveys}/admin/surveys?key=forms`).then((response) => response.data);
  }
}
