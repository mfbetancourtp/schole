import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateAssociate {
  id: number | null;
  moduleTypeId: number;
  semesterTemplateId: number;
}

export class CreateOrUpdateAssociateSemesterTemplateModuleTypeService extends PostBaseService<ICreateAssociate | any> {
  url = `${services.curricularDesign}/semesterTemplates/associateSemesterTemplateModuleType`;
  isFormData = false;
}
