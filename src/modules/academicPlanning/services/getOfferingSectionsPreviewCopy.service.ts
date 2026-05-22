import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOfferingSectionsPreviewCopyService {
  async run(params: { academicPeriodIdOrigin: number; programId: number }): Promise<any> {
    const response = await axios.get(`${services.academic}/planning/offering-sections/preview-copy`, { params });
    return response.data;
  }
}
