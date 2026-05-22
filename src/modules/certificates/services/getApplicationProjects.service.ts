import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ApplicationProjectDto } from '../dtos/applicationProject.dto';

interface IGetApplicationProjectsParams {
  page?: number;
  perPage?: number;
  search?: string;
  userId?: number | string;
  facultyId?: number | string;
  scheduleSettingsId?: number | string;
  status?: string;
  id?: number | string;
}

export class GetApplicationProjectsService {
  run(params: IGetApplicationProjectsParams = {}) {
    return axios.get<ApplicationProjectDto[]>(`${services.structure}/application-projects`, { params }).then((r) => r.data);
  }
}
