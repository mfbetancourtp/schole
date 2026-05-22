import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateStudentCategoryService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateStudentCategoryService extends CreateOrUpdateBaseService<ICreateOrUpdateStudentCategoryService> {
    url = `${services.academic}/institutional-configuration/student-categories`;
}