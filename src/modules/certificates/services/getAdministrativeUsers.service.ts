import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AdministrativeUserDto } from '../dtos/applicationProject.dto';

interface IGetAdministrativeUsersParams {
  page?: number;
  perPage?: number;
  order?: string;
  search?: string;
}

export class GetAdministrativeUsersService {
  run(params: IGetAdministrativeUsersParams = {}) {
    return axios.get<AdministrativeUserDto[]>(`${services.users}/access/users/administrative`, { params }).then((r) => r.data);
  }
}
