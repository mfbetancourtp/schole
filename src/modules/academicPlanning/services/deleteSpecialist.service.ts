import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSpecialistService {
    async run(specialistId: number): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/academic-period-specialists/${specialistId}`);
    }
}