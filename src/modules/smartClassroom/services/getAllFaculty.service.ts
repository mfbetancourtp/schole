import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Faculty } from '../dtos';

export class GetAllFacultyService {
  async run(): Promise<Faculty[]> {
    const response = await axios.get(`${services.smartClassroom}/faculty`);
    const data = response.data;
    if (Array.isArray(data)) return data as Faculty[];
    return [];
  }
}
