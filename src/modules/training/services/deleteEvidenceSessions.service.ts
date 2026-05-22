import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEvidenceSessionsService {
  async run(sessions: any) {
    await axios.delete(`${services.classroom}/classroom-implementation/sessions-load-url-evidence/${sessions}`);
  }
}
