import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export class ConfigureColumnsOfSelectedTemplateService extends CreateOrUpdateBaseService<any> {
    url = `${services.configurations}/export-table-columns-institutions`;
}    