import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AgreementsApplicationStatsDto } from '../dtos/agreementsApplication.dto';

export class GetAgreementsApplicationStatsService {
  run(): Promise<AgreementsApplicationStatsDto> {
    return axios.get<AgreementsApplicationStatsDto>(`${services.structure}/agreements-applications/stats`).then((r) => r.data);
  }
}
