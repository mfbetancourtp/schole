import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportParentsFromTemplateService {
  async run(data: any, academicPeriodId: number): Promise<void> {
    const newData = jsonToFormDataService.run(data);

    return await axios.post(`${services.academic}/academic-administration/academic-period/${academicPeriodId}/import-matriculate-parents`, newData).then((response) => response.data);
  }
}
