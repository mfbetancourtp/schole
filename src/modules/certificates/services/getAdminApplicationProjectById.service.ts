import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ApplicationProjectDto } from '../dtos/applicationProject.dto';

export class GetAdminApplicationProjectByIdService {
  run(id: number) {
    return axios.get<ApplicationProjectDto>(`${services.structure}/admin/application-projects/${id}`).then((r) => r.data);
  }
}
