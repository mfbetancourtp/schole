import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { ChecklistCategoryDto } from '../../dtos/checklist.dto';

export class GetChecklistCategoriesService {
  async run(): Promise<ChecklistCategoryDto[]> {
    return axios.get<{ data: ChecklistCategoryDto[] }>(`${services.forms}/categoria-checklist`).then((response) => response.data.data);
  }
}
