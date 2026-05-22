import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AdminApplicationDetailDto } from '../dtos/adminApplications.dto';

export class GetScholarshipApplicationAdminByIdService {
  run(id: number) {
    return axios.get<AdminApplicationDetailDto>(`${services.structure}/scholarship-applications/${id}`).then((r) => r.data);
  }
}
