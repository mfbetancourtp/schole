import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteFileTypeAttachmentService {
    async run(id: any): Promise<void> {
        await axios.delete(`${services.academic}/academic-planning/convocation-enrol-attachments/${id}`);
    }
}