import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTimetableByIdService {
  async run(id: string | number) {
    const response = await axios.get(`${services.smartClassroom}/timetables/${id}`);
    return response.data;
  }
}
