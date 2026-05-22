import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CreateSpecialistService {
    async run(data: any): Promise<void> {
        await axios.post(`${services.academic}/academic-planning/academic-period-specialists-from-array`, data);
    }
}