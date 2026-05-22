import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class PostNoteFinalsService {
  run(data: any) {
    return axios.post(`${services.reports}/cards-by-note-finals`, data).then((response) => response.data);
  }
}
