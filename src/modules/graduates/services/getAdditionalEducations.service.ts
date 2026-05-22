import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { GetCommonParams } from '../dtos/graduateProfile.dto';

export class GetAdditionalEducationsService {
  run(params?: GetCommonParams) {
    return axios.get(`${services.graduates}/additional-educations`, { params }).then((r) => r.data);
  }
}
