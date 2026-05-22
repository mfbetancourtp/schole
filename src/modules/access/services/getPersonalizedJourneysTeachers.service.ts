import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { PersonalizedJourneyTeacherDto } from '../dtos/teacherJourney.dto';

export class GetPersonalizedJourneysTeachersService {
  run(institutionId?: string | number) {
    return axios
      .get<PersonalizedJourneyTeacherDto[]>(`${services.structure}/personalized-journeys-teachers`, {
        params: {
          noPag: 'true',
          page: 1,
          perPage: 100,
          ...(institutionId ? { institutionId } : {}),
        },
      })
      .then((response) => response.data);
  }
}
