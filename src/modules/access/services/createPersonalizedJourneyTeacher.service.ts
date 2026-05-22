import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreatePersonalizedJourneyTeacherDto, PersonalizedJourneyTeacherDto } from '../dtos/teacherJourney.dto';

export class CreatePersonalizedJourneyTeacherService {
  run(payload: CreatePersonalizedJourneyTeacherDto) {
    return axios.post<PersonalizedJourneyTeacherDto>(`${services.structure}/personalized-journeys-teachers`, payload).then((response) => response.data);
  }
}
