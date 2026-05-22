import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateItemRolePermissionsService extends CreateOrUpdateBaseService<any> {
    url = `${services.users}/access/item-role-permissions`;
}