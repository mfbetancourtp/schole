import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  convocationEnrolId: number;
  convocationStepId: number;
}

export class GetQuestionsOfEnrolService {
  async run(surveySectionId: number, params: IParams) {
    return axios.get(`${services.surveys}/survey-sections/${surveySectionId}/questions-of-enrol`, { params }).then((response) => response.data);
  }
}
