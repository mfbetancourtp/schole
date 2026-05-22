import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { RegistrationExamDto } from '../dtos/registrationExam.dto';

export class GetRegistrationExamService {
  async run(checklistId: number): Promise<RegistrationExamDto> {
    return axios.get<RegistrationExamDto>(`${services.forms}/categoria-pregunta-checklist/${checklistId}`).then((response) => response.data);
  }
}
