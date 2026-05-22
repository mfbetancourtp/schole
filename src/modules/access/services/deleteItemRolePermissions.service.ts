import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteItemRolePermissionsService {
    async run(itemRolePermissionId: number): Promise<void> {
        await axios.delete(`${services.users}/access/item-role-permissions/${itemRolePermissionId}`);
    }
}