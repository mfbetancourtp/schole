import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { TeacherJourneysByUserDto } from '../dtos/teacherJourney.dto';

export class GetTeacherJourneysByUserService {
  run(userId: number) {
    return axios.get<TeacherJourneysByUserDto>(`${services.structure}/teacher-journeys/user/${userId}`).then((response) => response.data);
  }
}
