import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface IAssociateSemesterTemplateSubject {
  semesterTemplateId: number;
  subjectId: number;
}

export class CreateOrUpdateAssociateSemesterTemplateSubject extends PostBaseService<IAssociateSemesterTemplateSubject> {
  url = `${services.curricularDesign}/semesterTemplates/associateSemesterTemplateSubject`;
  isFormData = false;
}
