import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CurriculumOfferingDto } from '../dtos/curriculumOffering.dto';

export class GetCurriculumOfferingsService {
  async run(academicPeriodId: number): Promise<CurriculumOfferingDto[]> {
    const response = await axios.get<CurriculumOfferingDto[]>(`${services.academic}/planning/curriculum-offerings`, { params: { noPag: true, academicPeriodId } });
    return response.data;
  }
}
