import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { ProfileDto } from '../../../shared/dto/profile.dto';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateMainAssistencesService extends CreateOrUpdateBaseService<ProfileDto> {
  url = `${services.structure}/main-assistences`;
}
