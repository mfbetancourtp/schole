import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { ApplicationProjectMembersPaginationDto } from '../dtos/applicationProject.dto';

interface IGetApplicationProjectMembersParams {
  page?: number;
  perPage?: number;
  search?: string;
  userId?: number | string;
  applicationProjectsId?: number | string;
  status?: string;
}

export class GetApplicationProjectMembersService {
  run(params: IGetApplicationProjectMembersParams = {}) {
    return axios.get<ApplicationProjectMembersPaginationDto>(`${services.structure}/application-projects-members`, { params }).then((r) => r.data);
  }
}
