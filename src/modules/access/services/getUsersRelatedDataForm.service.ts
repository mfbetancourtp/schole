import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {RoleDto} from '../../../shared/dto/role.dto';

interface IGetUsersRelatedDataFormService {
    roles: RoleDto[];
}

export class GetUsersRelatedDataFormService {
    async run() {
        return axios.get<IGetUsersRelatedDataFormService>(`${services.users}/access/users-related-data-form`).then(response => response.data);
    }
}