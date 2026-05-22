import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { typeInvoiceDto } from '../dtos/typeInvoices.dto';

export class GetAllTypeInvoicesService {
  async run() {
    return axios.get<typeInvoiceDto[]>(`${services.budget}/admin/type-invoices`).then((response) => response.data);
  }
}
