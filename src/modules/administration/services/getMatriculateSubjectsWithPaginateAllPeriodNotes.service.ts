import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMatriculateSubjectsWithAllPeriodNotesService {
  run(subjectAssignmentId: any) {
    return axios.get(`${services.academic}/academic-administration/matriculate-subjects-with-all-period-notes?subjectAssignmentId=${subjectAssignmentId}`).then((response) => {
      console.log('response', response); // 👈 Aquí se ejecuta correctamente
      return response.data;
    });
  }
}
