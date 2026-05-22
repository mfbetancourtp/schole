import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {InvoiceDto} from '../dtos/invoice.dto';
import {DetailSaleDto} from '../dtos/detailSale.dto';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateSaleService {
    invoice: InvoiceDto;
    details: DetailSaleDto[];
}

export class CreateOrUpdateSaleService extends CreateOrUpdateBaseService<ICreateOrUpdateSaleService> {
    url = `${services.casurid}/payments/admin/invoices`;
}