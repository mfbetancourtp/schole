import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { InstitutionalAgreementStatsDto } from '../dtos/institutionalAgreement.dto';

export class GetInstitutionalAgreementStatsService {
  run(): Promise<InstitutionalAgreementStatsDto> {
    return axios.get<InstitutionalAgreementStatsDto>(`${services.structure}/agreements-institutional/stats`).then((response) => response.data);
  }
}
