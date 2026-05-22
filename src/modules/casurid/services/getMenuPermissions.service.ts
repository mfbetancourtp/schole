import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { MenuPermissionDto } from '../dtos/menuItem.dto';

export class GetMenuPermissionsService {
  run() {
    return axios.get<MenuPermissionDto[]>(`${services.v2}/menu/permissions`).then((response) => response.data);
  }
}
