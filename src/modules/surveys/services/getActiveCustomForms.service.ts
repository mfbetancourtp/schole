import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {CustomFormDto} from '../dtos/customForm.dto';
import {SurveyAppsConstant} from '../../../shared/constant/surveyApps.constant';

export class GetActiveCustomFormsService {
    async run() {
        return axios.get<CustomFormDto[]>(`${services.surveys}/admin/surveys`, {
            params: {
                active: 1,
                key: SurveyAppsConstant.forms,
            },
        }).then(response => response.data);
    }
}