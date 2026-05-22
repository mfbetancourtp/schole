import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ApplicationDto } from '../dtos/application.dto';

export class GetApplicationByIdService {
  run(agreementId: string | number, applicationId: string | number): Promise<ApplicationDto> {
    return axios.get<ApplicationDto>(`${services.structure}/agreements/${agreementId}/applications/${applicationId}`).then((response) => response.data);
  }
}
