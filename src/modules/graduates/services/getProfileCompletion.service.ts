import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ProfileCompletionDto } from '../dtos/graduateProfile.dto';

export class GetProfileCompletionService {
  run(peopleId: number): Promise<ProfileCompletionDto> {
    return axios
      .get(`${services.graduates}/personal-information/completion`, {
        params: { peopleId },
      })
      .then((r) => r.data);
  }
}
