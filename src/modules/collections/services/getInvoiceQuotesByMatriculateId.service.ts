import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface IParams extends ParamsPaginationDto {
    matriculateId: number
}

export class GetInvoiceQuotesByMatriculateIdService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/payments/matriculate/${params.matriculateId}/invoice-quotes`, { params })
            .then(response => response.data);
    }
}