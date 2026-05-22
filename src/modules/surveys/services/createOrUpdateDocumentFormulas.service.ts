import { services } from '../../../shared/constant/services';

import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

interface ICreateOrUpdateDocumentFormulasService {
  documentId: number;
  name: string;
  formula: string;
}

export class CreateOrUpdateDocumentFormulasService extends CreateOrUpdateBaseService<ICreateOrUpdateDocumentFormulasService> {
  url = `${services.academic}/academic-administration/document-formulas`;
}