import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { ConvocationWithStepForConfigureStepsDto } from '../dtos/convocation.dto';
import { StepTypeDto } from '../dtos/stepType.dto';

interface IGetConvocationStepsService {
  convocation: ConvocationWithStepForConfigureStepsDto;
  stepTypes: StepTypeDto[];
}

export class GetConvocationStepsService {
  async run(convocationId: number) {
    return axios.get<IGetConvocationStepsService>(`${services.academic}/academic-planning/${convocationId}/convocation-steps`)
      .then(response => response.data);
  }
}