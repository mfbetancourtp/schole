import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ProfessionalProfileCompletionDto } from '../dtos/professionalProfileCompletion.dto';

export class GetProfessionalProfileCompletionService {
  run(peopleId: number | string): Promise<ProfessionalProfileCompletionDto> {
    return axios.get<ProfessionalProfileCompletionDto>(`${services.structure}/professional-profiles/completion/${peopleId}`).then((response) => response.data);
  }
}
