import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateSubjectCategoryService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateSubjectCategoryService extends CreateOrUpdateBaseService<ICreateOrUpdateSubjectCategoryService> {
    url = `${services.academic}/academic-programs/subject-categories`;
}