import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class EditSpecialistService {
    async run(data: any, specialistId: number): Promise<void> {
        await axios.put(`${services.academic}/academic-planning/academic-period-specialists/${specialistId}`, data);
    }
}