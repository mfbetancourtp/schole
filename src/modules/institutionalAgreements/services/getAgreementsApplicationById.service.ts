import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ApplicationWithRelationsDto } from '../dtos/agreementsApplication.dto';

export class GetAgreementsApplicationByIdService {
  run(applicationId: string | number): Promise<ApplicationWithRelationsDto> {
    return axios.get<ApplicationWithRelationsDto>(`${services.structure}/agreements-applications/${applicationId}`).then((response) => response.data);
  }
}
