import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { CategoryMoodleDto } from '../dtos/customizeSynchronization.dto';

export class GetCategoriesMoodleService {
  run(params: any) {
    return axios
      .get<CategoryMoodleDto[]>(`${services.classroom}/categories-moodle`, {
        params,
      })
      .then((response) => response.data);
  }
}
