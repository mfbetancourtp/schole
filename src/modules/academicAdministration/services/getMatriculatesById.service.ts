import axios from '../../../shared/utils/axios';

import { MatriculateDetailDto } from '../dto/matriculate.dto';

import { services } from '../../../shared/constant/services';

export class GetMatriculatesByIdService {
  async run(matriculateId: number | string): Promise<MatriculateDetailDto> {
    const url = `${services.academic}/academic-administration/matriculates/${matriculateId}`;
    const response = await axios.get<MatriculateDetailDto>(url);

    return response.data;
  }
}
