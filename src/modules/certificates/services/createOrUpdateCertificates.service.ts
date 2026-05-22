import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateJourneyService {
  name: string;
  typeDocumentId: number;

  body?: string | null;
  header?: string | null;
  footer?: string | null;

  urlJsonTemplate?: string | null;
  urlHtmlTemplate?: string | null;

  marginTop?: string | null;
  marginBottom?: string | null;
  marginLeft?: string | null;
  marginRight?: string | null;

  backgroundImage?: string | null;
}

export class CreateOrUpdateCertificatesService extends CreateOrUpdateBaseService<ICreateOrUpdateJourneyService> {
  url = `${services.certificates}/templates`;
  isFormData = false;
}
