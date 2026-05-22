import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePersonalizedJourneyTeacherService {
  run(id: number) {
    return axios.delete(`${services.structure}/personalized-journeys-teachers/${id}`).then((response) => response.data);
  }
}
