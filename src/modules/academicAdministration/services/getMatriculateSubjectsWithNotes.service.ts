import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMatriculateSubjectsWithNotesService {
  run(matriculateId: any) {
    return axios.get(`${services.academicAdministration}/matriculate-subjects/${matriculateId}/subjects`).then((response) => response.data);
  }
}
