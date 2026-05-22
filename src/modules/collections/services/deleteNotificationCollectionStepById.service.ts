import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteNotificationCollectionStepByIdService {
    async run(notificationId: number): Promise<void> {
        await axios.delete(`${services.collections}/collection-step-notifications/${notificationId}`);
    }
}