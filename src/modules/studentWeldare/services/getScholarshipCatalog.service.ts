import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipCatalogPaginatedDto } from '../dtos/scholarship.dto';

export class GetScholarshipCatalogService {
  run(params?: any) {
    return axios.get<ScholarshipCatalogPaginatedDto>(`${services.structure}/scholarship-catalog`, { params }).then((r) => r.data);
  }
}
