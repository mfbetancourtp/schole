import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllStudentsService {
  async run(subjectAssignmentId: number) {
    return axios.get(`${services.classroom}/classroom-administration/course/${subjectAssignmentId}/course-inscriptions/subjects`).then((response) => response.data);
  }
}
