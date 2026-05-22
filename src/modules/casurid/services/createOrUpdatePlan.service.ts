import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdatePlanService {
    levelId: number | null;
    degreeId: number | null;
    subjectId: number | null;
    title: string;
    description: string;
    index?: string | null;
    thumbnail?: string | null;
    fileIndex: any | null;
    fileThumbnail: any | null;
    productTypeId?: number;
    defaultUnitValue: string;
    contentsIds: number[];
}

export class CreateOrUpdatePlanService extends CreateOrUpdateBaseService<ICreateOrUpdatePlanService> {
    url = `${services.casurid}/catalogue/admin/products`;
    isFormData = true;
}