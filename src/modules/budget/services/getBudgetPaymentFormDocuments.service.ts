import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface Iparams {
  budgetContractFormId?: any;
  budgetPaymentFormDocumentId?: any;
}

export class GetBudgetPaymentFormDocumentsService {
  async run(params: Iparams) {
    return axios
      .get(`${services.budget}/admin/budget-payment-form-documents`, {
        params,
      })
      .then((response) => response.data);
  }
}
