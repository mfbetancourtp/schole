import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class UpdateHistoryUploadContentService extends CreateOrUpdateBaseService<any> {
    url = `${services.casurid}/catalogue/admin/history-upload-contents`;
}
