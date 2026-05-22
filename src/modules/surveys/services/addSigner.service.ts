import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export interface IParams {
    convocationEnrolId: number;
    convocationStepId: number;
    documentId: number;
    documentSignature: {
        id: number | null;
        documentSignerId: number;
        peopleId: number | null;
        convocationEnrolDocumentId: number | null;
        jsonData: {};
    };
}

export class AddSignerService {
    async run(data: IParams) {
        await axios.post(`${services.academic}/academic-administration/documents-signatures`, data);
    }
}