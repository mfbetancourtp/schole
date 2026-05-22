import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportCurriculumsService {
  async run(studyPlanId: number, data: any): Promise<void> {
    const newData = jsonToFormDataService.run(data);

    return await axios.post(`${services.academic}/academic-programs/import-curriculums-template/${studyPlanId}`, newData).then((response) => response.data);
  }
}
