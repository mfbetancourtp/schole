import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCurJobsSubjByOrgJobCurSubIdService {
  async run(organizationalJobCurriculumSubjectId: number): Promise<void> {
    await axios.delete(`${services.organizational}/admin/curriculum-jobs-subjects/${organizationalJobCurriculumSubjectId}`);
  }
}
