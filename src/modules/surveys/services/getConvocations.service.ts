import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ConvocationWithStepsDto } from '../dtos/convocation.dto';

export class GetConvocationsService {
  async run(academicPeriodId: number) {
    return axios
      .get<ConvocationWithStepsDto[]>(`${services.academic}/academic-planning/convocations`, {
        params: {
          academicPeriodId,
        },
      })
      .then((response) => response.data);
  }
}
