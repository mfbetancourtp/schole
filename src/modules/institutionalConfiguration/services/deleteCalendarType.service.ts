import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCalendarTypeService {
    async run(calendarTypeId: number): Promise<void> {
        await axios.delete(`${services.academic}/institutional-configuration/calendar-types/${calendarTypeId}`);
    }
}