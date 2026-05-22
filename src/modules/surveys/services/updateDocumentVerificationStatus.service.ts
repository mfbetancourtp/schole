import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateDocumentVerificationStatusService {
    async run(id: any, data: any): Promise<void> {
        await axios.put(`${services.academic}/academic-planning/update-status-convocation-enrol-document/${id}`, data);
    }
}