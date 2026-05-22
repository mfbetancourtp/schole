import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CopyAcademicGroupService {
  async run(data: any): Promise<void> {
    await axios.post(`${services.classroom}/classroom-implementation/create-timetables-from-array`, data).then((response) => response.data);
  }
}
