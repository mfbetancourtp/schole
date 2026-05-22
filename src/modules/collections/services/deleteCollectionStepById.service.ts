import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteCollectionStepByIdService {
    async run(collectionStepId: number): Promise<void> {
        await axios.delete(`${services.collections}/collection-steps/${collectionStepId}`);
    }
}