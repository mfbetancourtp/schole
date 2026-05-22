import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    dateSince: string;
    dateUntil: string;
    status: string;
}

export class GetSalesWithPaginationService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/payments/invoices`, {
            params,
        }).then((response) => response.data);
    }
}