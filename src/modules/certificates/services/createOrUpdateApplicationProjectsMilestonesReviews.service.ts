import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateOrUpdateApplicationProjectsMilestonesReviewDto } from '../dtos/tutorPanel.dto';

export class CreateOrUpdateApplicationProjectsMilestonesReviewsService {
  async run(body: CreateOrUpdateApplicationProjectsMilestonesReviewDto) {
    return axios.post(`${services.structure}/application-projects-milestones-reviews`, body).then((response) => response.data);
  }
}
