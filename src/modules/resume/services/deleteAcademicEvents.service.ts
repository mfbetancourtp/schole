import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAcademicEventsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.structure}/academicEvents/${id}`);
  }
}
