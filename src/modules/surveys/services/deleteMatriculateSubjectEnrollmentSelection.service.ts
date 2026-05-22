import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMatriculateSubjectEnrollmentSelectionService {
  async run(matriculateSubjectId: number) {
    return axios.delete(`${services.academicAdministration}/matriculate-subjects/enrollment-selection/${matriculateSubjectId}`).then((response) => response.data);
  }
}
