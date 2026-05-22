import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {SubjectDto} from '../dtos/subject.dto';
import {LevelsDegreeDto} from '../dtos/levelsDegree.dto';
import {ContentTypeDto} from '../dtos/contentType.dto';

interface IGetFiltersContentForm {
    subjects: SubjectDto[];
    levelsDegrees: LevelsDegreeDto[];
    contentTypes: ContentTypeDto[];
}

export class GetFiltersContentForm {
    run() {
        return axios.get<IGetFiltersContentForm>(`${services.casurid}/catalogue/related-data-contents`).then((response) => {
            return response.data;
        });
    }
}