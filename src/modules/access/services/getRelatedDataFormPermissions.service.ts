import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {RoleDto} from '../../../shared/dto/role.dto';
import {ModuleDto} from '../../../shared/dto/module.dto';
import {PermissionDto} from '../../../shared/dto/permission.dto';

interface IGetRelatedDataFormPermissionsService {
    role: RoleDto;
    modulesInstitution: ModuleDto[];
    permissions: PermissionDto[];
}

export class GetRelatedDataFormPermissionsService {
    async run(roleId: number) {
        return axios.get<IGetRelatedDataFormPermissionsService>(`${services.users}/access/roles/${roleId}/related-data-form-permissions`).then(response => response.data);
    }
}