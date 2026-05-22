import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

// interface IGetRelatedDataFormPermissionsService {
//     role: RoleDto;
//     modulesInstitution: ModuleDto[];
//     permissions: PermissionDto[];
// }

export class GetProfileService {
    async run(userId?: number) {
        let param = '';

        if (userId) {
            param = `/${userId}`;
        }

        return axios.get(`${services.users}/people/general/profile${param}`)
            .then(response => response.data);
    }
}