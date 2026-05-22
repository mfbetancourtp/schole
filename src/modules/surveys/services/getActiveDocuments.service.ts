import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {DocumentDto} from '../dtos/document.dto';

export class GetActiveDocumentsService {
    async run() {
        return axios.get<DocumentDto[]>(`${services.academic}/academic-administration/documents-actives`).then(response => response.data);
    }
}