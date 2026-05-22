import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdatePersonalizedJourneyTeacherDto } from '../dtos/teacherJourney.dto';

export class UpdatePersonalizedJourneyTeacherService {
  run(id: number, payload: UpdatePersonalizedJourneyTeacherDto) {
    return axios.put(`${services.structure}/personalized-journeys-teachers/${id}`, payload).then((response) => response.data);
  }
}
