import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Timetable } from '../dtos';

export class GetTimetableByIdService {
  async run(id: string): Promise<Timetable> {
    const response = await axios.get(`${services.smartClassroom}/timetables/${id}`);
    return response.data as Timetable;
  }
}
