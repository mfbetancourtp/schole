import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ItemDto} from '../../../shared/dto/item.dto';

interface IParams {
    moduleId: number;
    roleId: number;
}

export class GetItemsWithPermissionsService {
    run(params: IParams) {
        return axios.get<ItemDto[]>(`${services.users}/access/items-with-permissions`, {
            params,
        }).then(response => response.data);
    }
}