import dayjs from 'dayjs';
import {dateFormat} from '../constant/dateFormat';

export class GetStartAndEndDateWeekService {
    run() {
        const currentDate = dayjs();

        return {
            startDate: currentDate.startOf('week').format(dateFormat.date),
            endDate: currentDate.endOf('week').format(dateFormat.date),
        };
    }
}