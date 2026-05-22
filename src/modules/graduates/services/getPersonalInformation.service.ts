import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { PersonalInformationResponse, GetCommonParams } from '../dtos/graduateProfile.dto';

export class GetPersonalInformationService {
  run(params?: GetCommonParams): Promise<PersonalInformationResponse> {
    return axios.get(`${services.graduates}/personal-information`, { params }).then((r) => r.data);
  }
}
