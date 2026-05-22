import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';
import { ConvocationwithEnrolsDto } from '../dtos/convocation.dto';

export class GetConvocationSummaryRegisteredByIdService {
  async run(convocationId: number) {
    return axios.get<ConvocationwithEnrolsDto>(`${services.academic}/academic-planning/convocations/${convocationId}/summary`)
      .then(response => response.data);
  }
}