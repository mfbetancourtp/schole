import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Timetable } from '../dtos';

export class GetAllTimetablesService {
  async run(): Promise<Timetable[]> {
    const response = await axios.get(`${services.smartClassroom}/timetables`);
    const data = response.data;
    if (Array.isArray(data)) return data as Timetable[];
    return [];
  }
}
