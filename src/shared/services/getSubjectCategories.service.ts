import axios from '../utils/axios';
import { services } from '../constant/services';
import { SubjectsCategoryDto } from '../dto/subjectsCategory.dto';

export class GetSubjectCategoriesService {
  run(): Promise<SubjectsCategoryDto[]> {
    return axios.get(`${services.academic}/academic-programs/subject-categories`).then((response) => response.data);
  }
}
