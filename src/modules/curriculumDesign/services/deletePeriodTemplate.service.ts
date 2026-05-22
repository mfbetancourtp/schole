import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeletePeriodTemplateService {
  async run(periodTemplateId: number): Promise<void> {
    await axios.delete(`${services.structure}/period-templates/${periodTemplateId}`);
  }
}
