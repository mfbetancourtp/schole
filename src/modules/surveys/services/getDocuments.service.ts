import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {DocumentDto} from '../dtos/document.dto';

export class GetDocumentsService {
    async run() {
        return axios.get<DocumentDto[]>(`${services.academic}/academic-administration/documents`).then(response => response.data);
    }
}