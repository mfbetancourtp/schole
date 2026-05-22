import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Course } from '../dtos';

export class GetAllCoursesService {
  async run(): Promise<Course[]> {
    const response = await axios.get(`${services.smartClassroom}/courses`);
    const data = response.data;
    if (Array.isArray(data)) return data as Course[];
    return [];
  }
}
