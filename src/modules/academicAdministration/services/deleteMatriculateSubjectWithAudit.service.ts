import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteMatriculateSubjectWithAuditservice {
    async run(data : any) {
      return axios.delete(`${services.academic}/academic-administration/matriculate-subjects/delete?matriculateIds=${data.matriculateId}&subjectAssignementId=${data.SubjectAssignment}&userId=${data.user}`).then((response) => response.data);
    }
  }
  