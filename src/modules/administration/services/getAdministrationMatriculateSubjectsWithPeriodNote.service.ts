import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAdministrationMatriculateSubjectsWithPeriodNoteService {
  run(matriculateId: any, params: any = {}) {
    return axios.get(`${services.academic}/academic-administration/matriculates/${matriculateId}/matriculate-subjects-with-period-notes`, { params }).then((response) => response.data);
  }
}
