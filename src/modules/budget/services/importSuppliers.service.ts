import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportSuppliersService {
  async run(data: any, params: any = {}): Promise<void> {
    const newData = jsonToFormDataService.run(data);

    return await axios.post(`${services.budget}/admin/template-financing-sources-proof-import`, newData, { params }).then((response) => response.data);
  }
}
