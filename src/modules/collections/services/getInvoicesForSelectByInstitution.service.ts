import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetInvoicesForSelectByInstitutionService {
    run(params: ParamsPaginationDto) {
        return axios.get(`${services.casurid}/payments/invoices-for-select-by-institution`, { params })
            .then((response) => response.data);
    }
}