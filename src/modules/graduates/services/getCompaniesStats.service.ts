import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface CompaniesStatsDto {
  totalCompanies: number;
  totalJobVacancies: number;
  totalActiveJobVacancies: number;
}

export class GetCompaniesStatsService {
  run(params: { institutionId?: number | null }) {
    return axios
      .get<CompaniesStatsDto>(`${services.graduates}/companies/stats`, {
        params,
      })
      .then((r) => r.data);
  }
}
