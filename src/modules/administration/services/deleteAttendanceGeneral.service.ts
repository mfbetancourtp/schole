import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAttendanceGeneralService {
    async run(id: any): Promise<void> {
        await axios.delete(`${services.classroom}/classroom-implementation/sessions-general/${id}`);
    }
}