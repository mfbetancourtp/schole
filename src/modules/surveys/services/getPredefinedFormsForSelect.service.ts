import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {PredefinedFormDto} from '../dtos/predefinedForm.dto';

export class GetPredefinedFormsForSelectService {
    async run() {
        return axios.get<PredefinedFormDto[]>(`${services.surveys}/admin/predefined-forms`).then(response => response.data);
    }
}