import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateTeacherJourneyDto, TeacherJourneyDto } from '../dtos/teacherJourney.dto';

export class CreateTeacherJourneyService {
  run(payload: CreateTeacherJourneyDto) {
    return axios.post<TeacherJourneyDto>(`${services.structure}/teacher-journeys`, payload).then((response) => response.data);
  }
}
