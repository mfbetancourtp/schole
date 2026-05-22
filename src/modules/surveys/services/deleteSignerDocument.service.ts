import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSignerDocumentService {
    async run(signerId: number) {
        await axios.delete(`${services.academic}/academic-administration/documents-signers/${signerId}`);
    }
}