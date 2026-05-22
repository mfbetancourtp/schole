import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { ChecklistTreeDto } from '../../dtos/checklist.dto';

export class GetChecklistTreeService {
  async run(checklistId: number): Promise<ChecklistTreeDto> {
    return axios.get<ChecklistTreeDto>(`${services.forms}/categoria-pregunta-checklist/${checklistId}`).then((response) => response.data);
  }
}
