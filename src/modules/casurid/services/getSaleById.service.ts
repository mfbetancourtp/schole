import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {SaleDto} from '../dtos/sale.dto';

export class GetSaleByIdService {
    async run(saleId: number) {
        return axios.get<SaleDto>(`${services.casurid}/payments/admin/invoices/${saleId}`).then((response) => response.data);
    }
}