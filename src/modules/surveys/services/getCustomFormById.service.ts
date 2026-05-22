import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { CustomFormDto } from '../dtos/customForm.dto';

export class GetCustomFormByIdService {
  async run(id: number): Promise<CustomFormDto> {
    const response = await axios.get<CustomFormDto>(`${services.surveys}/admin/surveys/${id}`);

    return response.data;
  }
}
