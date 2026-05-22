import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { IndustryDto } from '../dtos/company.dto';

export class GetIndustriesService {
  run(params?: { institutionId?: number | null }) {
    return axios
      .get<{ data: IndustryDto[] }>(`${services.graduates}/industries`, {
        params,
      })
      .then((r) => r.data.data);
  }
}
