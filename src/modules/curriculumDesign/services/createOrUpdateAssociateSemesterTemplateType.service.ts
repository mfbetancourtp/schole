import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface IAssociateSemesterTemplateTypes {
  semesterTemplateId: number;
  typeId: number;
}

export class CreateOrUpdateAssociateSemesterTemplateTypes extends PostBaseService<IAssociateSemesterTemplateTypes> {
  url = `${services.curricularDesign}/semesterTemplates/associateSemesterTemplateTypes`;
  isFormData = false;
}
