import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTeacherJourneyService {
  run(id: number) {
    return axios.delete(`${services.structure}/teacher-journeys/${id}`).then((response) => response.data);
  }
}
