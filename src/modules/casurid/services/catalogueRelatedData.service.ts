import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {LevelDto} from '../dtos/level.dto';
import {AreaDto} from '../dtos/area.dto';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';

interface ICatalogueRelatedDataService {
    levels: LevelDto[],
    areas: AreaDto[],
}

export class CatalogueRelatedDataService {
    async run() {
        return axios.get<ICatalogueRelatedDataService>(`${services.casurid}/catalogue/related-data-catalogue`).then((response) => {
            const data = response.data;

            data.levels.forEach((level) => {
                level.thumbnail = level.thumbnail ?? ImageNotAvailable;

                level.degrees.forEach((degree) => {
                    degree.thumbnail = degree.thumbnail ?? ImageNotAvailable;
                });
            });

            data.areas.forEach((area) => {
                area.thumbnail = area.thumbnail ?? ImageNotAvailable;

                area.subjects.forEach((subject) => {
                    subject.thumbnail = subject.thumbnail ?? ImageNotAvailable;
                });
            });

            return response.data;
        });
    }
}