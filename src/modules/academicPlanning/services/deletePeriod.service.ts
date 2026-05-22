import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeletePeriodService {
    async run(periodId: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/periods/${periodId}`);
    }
}