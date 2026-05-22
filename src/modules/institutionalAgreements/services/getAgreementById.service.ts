import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AgreementDto } from '../dtos/agreement.dto';

export class GetAgreementByIdService {
  run(id: string | number): Promise<AgreementDto> {
    return axios.get<AgreementDto>(`${services.structure}/agreements/${id}`).then((response) => response.data);
  }
}
