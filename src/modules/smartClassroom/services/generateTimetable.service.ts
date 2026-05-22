import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Timetable, GenerateTimetableDto } from '../dtos';

export class GenerateTimetableService {
  async run(data: GenerateTimetableDto): Promise<Timetable> {
    const response = await axios.post(`${services.smartClassroom}/timetables/generate`, data);
    return response.data as Timetable;
  }
}
