import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateRatingScaleDetailService {
  ratingScaleId: number;
  abbreviation: string;
  description: string;
  minimumValue: number;
  maximumValue: number;
  file: any;
}

export class CreateOrUpdateRatingScaleDetailService extends CreateOrUpdateBaseService<ICreateOrUpdateRatingScaleDetailService> {
  url = `${services.academic}/academic-programs/rating-scale-details`;
  isFormData = true;
}
