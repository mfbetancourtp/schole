import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface ISaveFormsByDocumentIdService {
    documentId: number;
    formIds: number[];
}

export class SaveFormsByDocumentIdService {
    async run(data: ISaveFormsByDocumentIdService) {
        await axios.post(`${services.academic}/academic-administration/documents-predefined-forms`, data);
    }
}