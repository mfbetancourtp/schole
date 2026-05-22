import {CreateOrUpdateBaseService} from '../services/createOrUpdateBase.service';
import {services} from '../constant/services';

interface ICreateOrUpdateCommentService {
    parentCommentId?: any;
    description: string;
    rowTable: string;
    rowId: number;
}

export class CreateOrUpdateCommentService extends CreateOrUpdateBaseService<ICreateOrUpdateCommentService> {
    url = `${services.communications}/comments`;
}