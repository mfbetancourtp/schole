import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteCourseInscriptionsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-administration/course-inscriptions/${id}`);
  }
}
