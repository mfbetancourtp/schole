import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteConvocationsEnrollsService {
  async run(convocationEnrolId: number) {
    await axios.delete(`${services.academic}/academic-planning/convocations-enrolls/${convocationEnrolId}`);
  }
}
