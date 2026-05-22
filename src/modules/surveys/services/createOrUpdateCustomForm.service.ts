import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';
import {SurveyAppsConstant} from '../../../shared/constant/surveyApps.constant';

export class CreateOrUpdateCustomFormService extends CreateOrUpdateBaseService<any> {
    url = `${services.surveys}/admin/surveys`;
    isFormData = true;
    params = {
        key: SurveyAppsConstant.forms,
    };
}