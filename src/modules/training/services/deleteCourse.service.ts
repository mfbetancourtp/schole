import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteCourseService {
  async run(courseId: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-administration/courses/${courseId}`);
  }
}
