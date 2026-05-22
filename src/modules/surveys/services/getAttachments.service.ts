import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {AttachmentDto} from '../dtos/attachment.dto';

export class GetAttachmentsService {
    async run() {
        return axios.get<AttachmentDto[]>(`${services.academic}/academic-administration/requirements`).then(response => response.data);
    }
}