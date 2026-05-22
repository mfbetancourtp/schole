import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { RatingScaleDto } from '../dtos/ratingScale.dto';

export class GetRatingScalesService {
    run() {
        return axios.get<RatingScaleDto[]>(`${services.academic}/academic-programs/rating-scales`)
            .then((response) => response.data);
    }
}