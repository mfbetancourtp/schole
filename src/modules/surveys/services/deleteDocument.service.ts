import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteDocumentService {
    async run(documentId: number) {
        await axios.delete(`${services.academic}/academic-administration/documents/${documentId}`);
    }
}