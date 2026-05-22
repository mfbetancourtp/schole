import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostSubjectNotesEditService {
  run(data: any) {
    return axios.post(`${services.academic}/academic-administration/update-state-is-edit-matriculate-subject-periods`, data).then((response) => response.data);
  }
}
