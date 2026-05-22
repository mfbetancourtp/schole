import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {PredefinedFormDto} from '../dtos/predefinedForm.dto';

export class GetFormsByDocumentIdService {
    async run(documentId: number) {
        return axios.get<PredefinedFormDto[]>(`${services.academic}/academic-administration/${documentId}/documents-predefined-forms`).then(response => response.data);
    }
}