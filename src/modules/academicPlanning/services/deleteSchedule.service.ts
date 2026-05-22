import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteScheduleService {
  async run(scheduleId: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-implementation/time-tables/${scheduleId}`);
  }
}