import axios from '../utils/axios';
import { services } from '../constant/services';
import { LevelsWithDegreesDto } from '../dto/levelsWithDegrees.dto';

export class GetLevelsWithDegreesService {
    run() {
        return axios.get<LevelsWithDegreesDto[]>(`${services.academic}/academic-programs/levels-with-degrees`)
            .then((response) => response.data);
    }
}