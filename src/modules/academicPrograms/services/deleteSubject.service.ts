import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSubjectService {
  async run(subjectId: number) {
    await axios.delete(`${services.structure}/subjects/${subjectId}`);
  }
}
