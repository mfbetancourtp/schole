import dayjs from 'dayjs';
import {dateFormat} from '../constant/dateFormat';

export class GetStartAndEndDateMonthService {
    run() {
        const currentDate = dayjs();

        return {
            startDate: currentDate.startOf('month').format(dateFormat.date),
            endDate: currentDate.endOf('month').format(dateFormat.date),
        };
    }
}