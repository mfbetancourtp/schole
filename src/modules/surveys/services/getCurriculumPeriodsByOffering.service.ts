import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CurriculumPeriodDto } from '../dtos/curriculumOffering.dto';

export interface CurriculumPeriodsByOfferingParams {
  academicPeriodId: number;
  programId: number;
  campusId: number;
  institutionId?: number;
}

export class GetCurriculumPeriodsByOfferingService {
  async run(params: CurriculumPeriodsByOfferingParams): Promise<CurriculumPeriodDto[]> {
    const response = await axios.get(`${services.structure}/curriculum-periods/by-offerings/public`, { params });
    return response.data?.data ?? [];
  }
}
