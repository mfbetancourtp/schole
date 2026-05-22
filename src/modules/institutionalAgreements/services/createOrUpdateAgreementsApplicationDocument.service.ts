import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateAgreementsApplicationDocumentDto } from '../dtos/agreementsApplicationDocument.dto';

export class CreateOrUpdateAgreementsApplicationDocumentService extends CreateOrUpdateBaseService<CreateAgreementsApplicationDocumentDto> {
  url = `${services.structure}/agreements-applications-documents`;
  isFormData = true;
}
