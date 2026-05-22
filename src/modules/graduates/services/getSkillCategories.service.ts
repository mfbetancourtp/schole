import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetSkillCategoriesParams, SkillCategoriesResponseDto } from '../dtos/graduateProfile.dto';

export class GetSkillCategoriesService {
  run(params: GetSkillCategoriesParams) {
    return axios.get<SkillCategoriesResponseDto>(`${services.graduates}/skill-categories`, { params }).then((r) => r.data);
  }
}
