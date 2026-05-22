import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateDocumentService extends CreateOrUpdateBaseService<any> {
    url = `${services.academic}/academic-administration/documents`;
}