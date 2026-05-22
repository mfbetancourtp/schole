import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { ConvocationDto } from '../dtos/convocation.dto';

export class GetConvocationByIdService {
  async run(convocationId: any) {
    return axios.get<ConvocationDto>(`${services.academic}/academic-planning/convocations/${convocationId}`).then((response) => response.data);
  }
}
