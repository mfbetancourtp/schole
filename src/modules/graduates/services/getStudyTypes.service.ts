import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetStudyTypesParams, StudyTypesResponseDto } from '../dtos/graduateProfile.dto';

export class GetStudyTypesService {
  run(params?: GetStudyTypesParams) {
    return axios
      .get<StudyTypesResponseDto>(`${services.structure}/education-types`, {
        params,
      })
      .then((r) => r.data);
  }
}
