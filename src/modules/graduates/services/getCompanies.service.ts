import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { CompanyDto } from '../dtos/company.dto';

interface GetCompaniesParams {
  institutionId?: number | null;
  industryId?: number | null;
  companySizeId?: number | null;
  search?: string | null;
}

export class GetCompaniesService {
  run(params: GetCompaniesParams) {
    return axios
      .get<{ data: CompanyDto[] }>(`${services.graduates}/companies`, {
        params,
      })
      .then((r) => r.data.data);
  }
}
