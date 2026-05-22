import {CreateOrUpdateBaseService} from './createOrUpdateBase.service';
import {services} from '../constant/services';

// interface ICreateOrUpdateOpenAtService {
//     id: number;
//     institutionId: number;
//     avatar: string;
//     title: string;
//     description: string;
//     urlRedirect?: string | null;
//     titleAnnouncements?: string | null;
//     notificationType: number;
//     communicationId: number;
//     createdAt: string;
//     updatedAt?: string | null;
//     open: number;
//     openAt: string;
//     notificationReceiverId: number;
// }

export class CreateOrUpdateOpenAtService extends CreateOrUpdateBaseService<any[]> {
    url = `${services.communications}/notifications-receivers/openAt`;
}