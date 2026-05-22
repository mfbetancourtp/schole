import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetObserverReportForAllMatriculatesService {
  async run(params: any) {
    return axios
      .post(
        `${services.reports}/observer-for-all-matriculates?academicPeriodId=${params.academicPeriodId ?? ''}&levelId=${params.levelId ?? ''}&degreeId=${params.degreeId ?? ''}&groupId=${
          params.groupId ?? ''
        }&itemCode=${params.itemCode ?? ''}`
      )
      .then((response) => response.data);
  }
}
