import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {SurveyAppsConstant} from '../../../shared/constant/surveyApps.constant';
import {CustomFormDto} from '../dtos/customForm.dto';

export class GetAllCustomFormService {
    run() {
        return axios.get<CustomFormDto[]>(`${services.surveys}/admin/surveys`, {
            params: {
                key: SurveyAppsConstant.forms,
            },
        }).then((response) => response.data);
    }
}