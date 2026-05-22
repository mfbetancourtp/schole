import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import type { AcademicLoadContractType } from '../dtos/academicLoadManagement.dto';

export class GetContractTypesService {
  async run(params?: any): Promise<AcademicLoadContractType[]> {
    const response = await axios.get<AcademicLoadContractType[]>(`${services.graduates}/contract-types`, {
      params,
    });

    return response.data;
  }
}
