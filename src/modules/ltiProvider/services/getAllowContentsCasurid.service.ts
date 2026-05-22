import axios from '../../../shared/utils/axios';
import {services} from "../../../shared/constant/services";
import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    subjectId?:number;
    degreeId?:number;
}

export class GetAllowContentsCasuridService {
    run(params: IParams) {
        return axios.get(`${services.lti}/integrations/lti/allow-contents-casurid`, {
            params,
        }).then((response) => response.data);

        // return {
        //     data: [
        //         {
        //             degreeId: 1,
        //             subjectId: 1,
        //             title: "titulo 1 - grado 1 - asignatura 1",
        //         },
        //         {
        //             degreeId: 2,
        //             subjectId: 1,
        //             title: "titulo 1 - grado 2 - asignatura 1",
        //         },
        //         {
        //             degreeId: 3,
        //             subjectId: 1,
        //             title: "titulo 1 - grado 3 - asignatura 1",
        //         },
        //         {
        //             degreeId: 4,
        //             subjectId: 1,
        //             title: "titulo 1 - grado 4 - asignatura 1",
        //         },
            
        //         {
        //             degreeId: 1,
        //             subjectId: 2,
        //             title: "titulo 1 - grado 1 - asignatura 2",
        //         },
        //         {
        //             degreeId: 2,
        //             subjectId: 2,
        //             title: "titulo 1 - grado 2 - asignatura 2",
        //         },
        //         {
        //             degreeId: 3,
        //             subjectId: 2,
        //             title: "titulo 1 - grado 3 - asignatura 2",
        //         },
        //         {
        //             degreeId: 4,
        //             subjectId: 2,
        //             title: "titulo 1 - grado 4 - asignatura 2",
        //         },
            
        //         {
        //             degreeId: 1,
        //             subjectId: 3,
        //             title: "titulo 1 - grado 1 - asignatura 3",
        //         },
        //         {
        //             degreeId: 2,
        //             subjectId: 3,
        //             title: "titulo 1 - grado 2 - asignatura 3",
        //         },
        //         {
        //             degreeId: 3,
        //             subjectId: 3,
        //             title: "titulo 1 - grado 3 - asignatura 3",
        //         },
        //         {
        //             degreeId: 4,
        //             subjectId: 3,
        //             title: "titulo 1 - grado 4 - asignatura 3",
        //         },
        //     ],
        //     page: 1,
        //     perPage: 10,
        //     total: 2,
        // };
    }
}