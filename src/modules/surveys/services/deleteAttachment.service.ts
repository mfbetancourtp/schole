import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteAttachmentService {
    async run(attachmentId: number) {
        await axios.delete(`${services.academic}/academic-administration/requirements/${attachmentId}`);
    }
}