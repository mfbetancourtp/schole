import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';
import { subcategorizationDto } from '../dtos/subcategorization.dto';

export class GetAllSubcategorizationService {
  async run() {
    return axios.get<subcategorizationDto[]>(`${services.budget}/admin/source-categorization-category`).then((response) => response.data);
  }
}
