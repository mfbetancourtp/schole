import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CopyClassroomSubjectAssignmentsService {
  run(subjectAssignmentId: number) {
    return axios.get(`${services.academic}/academic-administration/subject-assignments/${subjectAssignmentId}/copy-classroom`).then((response) => response.data);
  }
}
