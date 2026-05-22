import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams {
    debtorUserId: number;
    email: string;
    subject: string;
    message: string;
    quotesIds: number[];
    convocationEnrolDocumentIds: number[];
    convocationEnrolAttachmentIds: number[];
}

export class PostLegalCollectionsService {
    async run(data: IParams): Promise<void> {
        return await axios.post(`${services.collections}/legal-collections`, data)
            .then(response => response.data);
    }
}