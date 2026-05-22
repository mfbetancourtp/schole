import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {RoleDto} from '../../../shared/dto/role.dto';

export class GetAllRolesService {
    async run() {
        return axios.get<RoleDto[]>(`${services.users}/access/roles`).then(response => response.data);
    }
}