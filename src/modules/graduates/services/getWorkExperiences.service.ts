import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { GetCommonParams } from '../dtos/graduateProfile.dto';

export class GetWorkExperiencesService {
  run(params?: GetCommonParams) {
    return axios.get(`${services.graduates}/work-experiences`, { params }).then((r) => r.data);
  }
}
