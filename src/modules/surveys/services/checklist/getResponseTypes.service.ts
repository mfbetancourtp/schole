import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { ChecklistResponseTypeDto } from '../../dtos/checklist.dto';

export class GetResponseTypesService {
  async run(): Promise<ChecklistResponseTypeDto[]> {
    return axios.get<{ data: ChecklistResponseTypeDto[] }>(`${services.forms}/tipo-respuesta`).then((response) => response.data.data);
  }
}
