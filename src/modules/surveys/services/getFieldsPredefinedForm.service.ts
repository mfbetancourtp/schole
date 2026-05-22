import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {FieldPredefinedFormDto} from '../dtos/fieldPredefinedForm.dto';

export class GetFieldsPredefinedFormService {
    async run(predefinedFormId: number) {
        return axios.get<FieldPredefinedFormDto[]>(`${services.surveys}/admin/table-fields/${predefinedFormId}`).then(response => response.data);
    }
}