import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { LanguageDto } from '../dtos/language.dto';

export class CreateOrUpdateLanguageService extends CreateOrUpdateBaseService<LanguageDto> {
  url = `${services.graduates}/languages`;
  isFormData = false;
}
