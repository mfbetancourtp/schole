import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdateTeacherJourneyDto } from '../dtos/teacherJourney.dto';

export class UpdateTeacherJourneyService {
  run(id: number, payload: UpdateTeacherJourneyDto) {
    return axios.put(`${services.structure}/teacher-journeys/${id}`, payload).then((response) => response.data);
  }
}
