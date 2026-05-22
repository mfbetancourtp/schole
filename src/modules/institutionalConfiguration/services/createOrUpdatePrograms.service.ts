import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateProgramsService {
  departmentId?: number;
  description?: string;
  ratingScaleId?: number;
  operationalSchemeId?: number;
  name?: string;
  code?: string;
  qualifiedRegistration?: string;
  sniesCode?: string;
  internalRecord?: string;
  approvalResolution?: string;
  programTitle?: string;
  state?: string;
  effectiveDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  hasHighQualityAccreditation?: number;
  entryProfile?: string;
  graduateProfile?: string;
  researchLines?: string;
  occupationalFields?: string;
  maximumCapacity?: number;
  minimumCapacity?: number;
  directorUserId?: number;
  inactivationReasonId?: number | null;
  inactivationObservations?: string | null;
  competencies?: Array<{
    id?: number;
    name?: string;
    code?: string;
    competencyType?: string;
  }>;
}

export class CreateOrUpdateProgramsService extends CreateOrUpdateBaseService<ICreateOrUpdateProgramsService> {
  url = `${services.structure}/programs`;
  isFormData = false;
}
