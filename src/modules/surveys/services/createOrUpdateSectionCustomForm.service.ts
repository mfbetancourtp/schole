import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';
import {SectionDto} from '../dtos/section.dto';

export class CreateOrUpdateSectionCustomFormService extends CreateOrUpdateBaseService<SectionDto> {
    url = `${services.surveys}/admin/survey-sections`;
}