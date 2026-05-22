import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCurriculumSubjectWithAuditservice {
    async run(curriculumSubjectId: number, UserId:number) {
      return axios.delete(`${services.academic}/academic-programs/curriculum-subjects/delete/${curriculumSubjectId}?userId=${UserId}`).then((response) => response.data);
    }
  }