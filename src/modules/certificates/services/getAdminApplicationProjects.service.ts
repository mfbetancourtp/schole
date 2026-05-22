import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AdminApplicationProjectListPaginationDto } from '../dtos/applicationProject.dto';

interface IGetAdminApplicationProjectsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  facultyId?: number | string;
  order?: string;
}

export class GetAdminApplicationProjectsService {
  run(params: IGetAdminApplicationProjectsParams = {}) {
    return axios.get<AdminApplicationProjectListPaginationDto>(`${services.structure}/admin/application-projects`, { params }).then((r) => r.data);
  }
}
