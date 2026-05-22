import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { JsonToFormDataService } from '../../../shared/services/jsonToFormData.service';

const jsonToFormDataService = new JsonToFormDataService();

export class ImportClasroomFromTemplateService {
  async run(data: any, params: any = {}): Promise<void> {
    const newData = jsonToFormDataService.run(data);

    return await axios.post(`${services.classroom}/classroom-implementation/import-time-tables`, newData, { params }).then((response) => response.data);
  }
}
