import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { CompanySizeDto } from '../dtos/company.dto';

export class GetCompanySizesService {
  run(params?: { institutionId?: number | null }) {
    return axios
      .get<{ data: CompanySizeDto[] }>(`${services.graduates}/company-sizes`, {
        params,
      })
      .then((r) => r.data.data);
  }
}
