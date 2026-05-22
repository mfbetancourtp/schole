import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IParams {
  convocationEnrolId: number;
  academicPeriodGroupId: number;
}

export class MatriculateFromConvocationService {
  async run(data: IParams) {
    await axios.post(`${services.academic}/academic-administration/matriculate-from-convocation`, data);
  }
}
