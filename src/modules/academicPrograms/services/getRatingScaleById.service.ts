import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { RatingScaleDto } from '../dtos/ratingScale.dto';

export class GetRatingScaleByIdService {
    run(ratingScaleId: number) {
        return axios.get<RatingScaleDto>(`${services.academic}/academic-programs/rating-scales/${ratingScaleId}`)
            .then((response) => response.data);
    }
}