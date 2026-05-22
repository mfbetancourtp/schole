import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { UpdateApplicationProjectStatusDto } from '../dtos/applicationProject.dto';

export class UpdateApplicationProjectStatusService {
  run(id: number, data: UpdateApplicationProjectStatusDto) {
    return axios.put(`${services.structure}/admin/application-projects/${id}/status`, data).then((r) => r.data);
  }
}
