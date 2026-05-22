import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAcademicPeriodService {
    async run(itemId: number): Promise<void> {
        await axios.delete(`${services.admin}/configure-menu/items/${itemId}`);
    }
}