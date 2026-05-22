import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    levelId: number;
    degreeId: number;
    subjectId: number;
}

export class GetContentsWithPaginationService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/catalogue/admin/contents`, {
            params,
        }).then(response => {
            const dataPagination = response.data;
            const data: any = [];
            dataPagination.data.forEach((contentMain: any) => {

                contentMain.contents.map((content: any) => {
                    data.push({
                        levelDegree: contentMain.levelDegree,
                        ...content,
                    });
                });
            });

            dataPagination.data = data;

            return dataPagination;
        });
    }
}