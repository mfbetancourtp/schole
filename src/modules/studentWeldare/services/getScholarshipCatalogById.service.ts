import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ScholarshipCatalogResponseDto } from '../dtos/scholarship.dto';

export class GetScholarshipCatalogByIdService {
  run(id: number) {
    return axios.get<ScholarshipCatalogResponseDto>(`${services.structure}/scholarship-catalog/${id}`).then((r) => r.data);
  }
}
