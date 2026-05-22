import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteActivityByIdService {
    async run(id: any): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-assessment/activities/${id}`);
    }
}