import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';

export class GetInstitutionalAgreementByIdService {
  run(id: number | string): Promise<InstitutionalAgreementDto> {
    return axios.get<InstitutionalAgreementDto>(`${services.structure}/agreements-institutional/${id}`).then((response) => response.data);
  }
}
