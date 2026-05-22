import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    dateSince: string;
    dateUntil: string;
    status: string;
}

export class GetInvoicesByUserIdWithPaginationService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/payments/invoices-by-user-id`, { params })
            .then((response) => response.data);
    }
}