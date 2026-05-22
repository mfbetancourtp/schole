import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CurriculumOfferingDto } from '../dtos/curriculumOffering.dto';

export class GetCurriculumOfferingsPublicService {
  async run(params?: any): Promise<CurriculumOfferingDto[]> {
    const response = await axios.get<CurriculumOfferingDto[]>(`${services.academic}/planning/curriculum-offerings/public`, { params });
    return response.data;
  }
}
