import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCategoriesMoodleByLmsInstitutionPlatformIdService {
  async run(lmsInstitutionPlatformId: number) {
    return axios.get<any>(`${services.classroom}/categories-moodle?lmsInstitutionPlatformId=${lmsInstitutionPlatformId}`).then((response) => response.data);
  }
}
