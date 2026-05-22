import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CompetencyWithLearningOutcomeAndTopicDto } from '../dtos/competency.dto';

export class GetCompetenceByIdService {
  run(competenceId: number) {
    return axios.get<CompetencyWithLearningOutcomeAndTopicDto>(`${services.classroom}/classroom-administration/competencies/${competenceId}`).then((response) => response.data);
  }
}
