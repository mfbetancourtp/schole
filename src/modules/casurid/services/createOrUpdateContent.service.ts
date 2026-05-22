import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateContentService {
    levelId: number | null;
    degreeId: number | null;
    subjectId: number | null;
    title: string | null;
    description: string | null;
    contentZip: any | null;
    urlLocation: string | null;
    contentTypeId: number | null;
    contentPdf: any | null;
    duration: number | null;
}

export class CreateOrUpdateContentService extends CreateOrUpdateBaseService<ICreateOrUpdateContentService> {
    url = `${services.casurid}/catalogue/admin/contents`;
    isFormData = true;
}