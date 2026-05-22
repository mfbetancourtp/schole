import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    status: number;
    invoiceId: number;
    dateSince: string;
    dateUntil: string;
    institutionIdClient: number;
}

export class GetCollectionsWithPaginationService {
    run(params?: IParams) {
        return axios.get(`${services.casurid}/admin/payments`, {
            params,
        }).then(response => response.data);
    }
}