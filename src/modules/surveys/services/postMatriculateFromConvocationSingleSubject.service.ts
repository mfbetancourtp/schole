import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostMatriculateFromConvocationSingleSubjectService {
  async run(data: { convocationEnrollId: number; curriculumOfferingSubjectId: number }) {
    return axios.post(`${services.academicAdministration}/matriculates/from-convocation/single-subject`, data).then((response) => response.data);
  }
}
