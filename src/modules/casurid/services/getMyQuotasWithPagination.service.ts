import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    invoiceId: number;
    status: string;
}

export class GetMyQuotasWithPaginationService {
    run(params?: IParams) {
        return axios.get(`${services.casurid}/payments/invoices-quotes-client`, {
            params,
        }).then(response => response.data);
    }
}