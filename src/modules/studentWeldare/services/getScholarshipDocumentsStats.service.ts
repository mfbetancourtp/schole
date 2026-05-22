import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetScholarshipDocumentsStatsService {
  run() {
    return axios.get(`${services.structure}/scholarship-documents/stats`).then((r) => r.data);
  }
}
