import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { parentDto } from '../dto/parent.dto';

export class GetMatriculatesParentsService {
  run(matriculateId: any): Promise<parentDto[]> {
    return axios.get<parentDto[]>(`${services.academic}/academic-administration/matriculates/${matriculateId}/parents`).then((response) => response.data);
  }
}
