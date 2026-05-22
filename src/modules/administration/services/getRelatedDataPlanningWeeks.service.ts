import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IParams {
  courseId: number;
}

export class GetRelatedDataPlanningWeeksService {
  async run(params: IParams) {
    return axios.get(`${services.classroom}/classroom-assessment/related-data-planning-weeks`, { params }).then((response) => response.data);
  }
}
