import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypeInvoicesByIdService {
  async run(typeInvoiceId: number) {
    return axios.delete<any>(`${services.budget}/admin/type-invoices/${typeInvoiceId}`).then((response) => response.data);
  }
}
