import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    status: string;
    dateSince: string;
    dateUntil: string;
    invoiceId: number;
    institutionIdClient: number;
}

export class GetQuotasWithPaginationService {
    run(params?: IParams) {
        return axios.get(`${services.casurid}/payments/admin/invoices-quotes`, {
            params,
        }).then(response => response.data);
    }
}