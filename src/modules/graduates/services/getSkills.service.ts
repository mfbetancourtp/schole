import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetSkillsParams, GraduateSkillsResponseDto } from '../dtos/graduateProfile.dto';

export class GetSkillsService {
  run(params: GetSkillsParams) {
    return axios
      .get<GraduateSkillsResponseDto>(`${services.graduates}/skills`, {
        params,
      })
      .then((r) => r.data);
  }
}
