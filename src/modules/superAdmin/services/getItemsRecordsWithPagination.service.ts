import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    moduleId: number;
    showMenu: number;
    isReport: number;
}
export class GetItemsRecordsWithPaginationService {
    async run(params : IParams) {
        return axios.
            get<any>(`${services.admin}/configure-menu/items-pagination`,{
                params,
            }
        )
        .then((response) => response.data);
    }
}