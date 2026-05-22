import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateScholarshipDocument {
  code: string;
  name: string;
  description: string;
  abjuntoType: string;
  isActive: boolean;
}

export class CreateOrUpdateScholarshipDocumentService extends CreateOrUpdateBaseService<ICreateOrUpdateScholarshipDocument> {
  url = `${services.structure}/scholarship-documents`;
  isFormData = false;
}
