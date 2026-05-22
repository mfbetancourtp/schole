import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface ISaveSignersDocumentService {
    documentId: number;
    signerTypeId: number;
    relationshipId: number;
    additionalFields: string[];
}

export class SaveSignersDocumentService {
    async run(data: ISaveSignersDocumentService) {
        await axios.post(`${services.academic}/academic-administration/documents-signers`, data);
    }
}