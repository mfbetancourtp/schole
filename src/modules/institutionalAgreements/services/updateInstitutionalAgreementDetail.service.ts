import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { UpdateInstitutionalAgreementDetailDto } from '../dtos/institutionalAgreement.dto';

export class UpdateInstitutionalAgreementDetailService {
  run(id: number | string, data: UpdateInstitutionalAgreementDetailDto): Promise<any> {
    return axios.put(`${services.structure}/agreements-institutional/${id}/detail`, data).then((response) => response.data);
  }
}
