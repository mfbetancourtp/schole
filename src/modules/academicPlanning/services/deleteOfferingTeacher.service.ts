import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteOfferingTeacherService {
  async run(offeringSubjectTeacherId: number): Promise<void> {
    await axios.delete(`${services.academic}/planning/offering-teachers/${offeringSubjectTeacherId}`);
  }
}
