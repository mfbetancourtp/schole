import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateInstitutionService {
  institution: {
    identification: number;
    name: string;
    active: number;
    phone: string | null;
    email: string;
    municipalityId: number;
    address: string;
    secretKey: string;
    publicKey: string | null;
    lmsUrlApiRest: string;
    isClient: number | boolean;
    logo: any;
  };
  user: {
    id: number | null;
    userToken: string;
    password: string;
    passwordConfirmation: string;
  };
}

export class CreateOrUpdateInstitutionService extends CreateOrUpdateBaseService<ICreateOrUpdateInstitutionService> {
  url = `${services.casurid}/clients/institutions`;
  isFormData = false;
}
