import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {AttachmentDto} from '../dtos/attachment.dto';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateAttachmentService extends CreateOrUpdateBaseService<AttachmentDto> {
    url = `${services.academic}/academic-administration/requirements`;
    isFormData = true;
}